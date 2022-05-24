import { Event, Identity } from "@budibase/types"
import { EventProcessor } from "./types"

export default class Processor implements EventProcessor {
  initialised: boolean = false
  processors: EventProcessor[] = []

  constructor(processors: EventProcessor[]) {
    this.processors = processors
  }

  async processEvent(
    event: Event,
    identity: Identity,
    properties: any,
    timestamp?: string | number
  ): Promise<void> {
    for (const eventProcessor of this.processors) {
      await eventProcessor.processEvent(event, identity, properties, timestamp)
    }
  }

  shutdown() {
    for (const eventProcessor of this.processors) {
      eventProcessor.shutdown()
    }
  }
}
