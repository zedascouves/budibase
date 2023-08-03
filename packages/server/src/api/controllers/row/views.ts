import { quotas } from "@budibase/pro"
import {
  UserCtx,
  ViewV2,
  SearchRowRequest,
  SearchRowResponse,
} from "@budibase/types"
import sdk from "../../../sdk"

export async function searchView(
  ctx: UserCtx<SearchRowRequest, SearchRowResponse>
) {
  const { viewId } = ctx.params

  const view = await sdk.views.get(viewId)
  if (!view) {
    ctx.throw(404, `View ${viewId} not found`)
  }

  if (view.version !== 2) {
    ctx.throw(400, `This method only supports viewsV2`)
  }

  const table = await sdk.tables.getTable(view?.tableId)

  const viewFields =
    (view.columns &&
      Object.entries(view.columns).length &&
      Object.keys(sdk.views.enrichSchema(view, table.schema).schema)) ||
    undefined

  ctx.status = 200
  const result = await quotas.addQuery(
    () =>
      sdk.rows.search({
        tableId: view.tableId,
        query: view.query || {},
        fields: viewFields,
        ...getSortOptions(ctx.request.body, view),
      }),
    {
      datasourceId: view.tableId,
    }
  )

  result.rows.forEach(r => (r._viewId = view.id))
  ctx.body = result
}

function getSortOptions(request: SearchRowRequest, view: ViewV2) {
  if (request.sort) {
    return {
      sort: request.sort,
      sortOrder: request.sortOrder,
      sortType: request.sortType,
    }
  }
  if (view.sort) {
    return {
      sort: view.sort.field,
      sortOrder: view.sort.order,
      sortType: view.sort.type,
    }
  }

  return undefined
}
