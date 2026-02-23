import { Player } from "@signal-app/player"
import { deserializeSingleEvent, Stream } from "midifile-ts"
import { MIDIDeviceStore } from "../stores/MIDIDeviceStore"

export class MIDIMonitor {
  channel: number = 0

  constructor(
    private readonly player: Player,
    private readonly midiDeviceStore: MIDIDeviceStore,
  ) {}

  onMessage(e: WebMidi.MIDIMessageEvent) {
    const stream = new Stream(e.data)
    const event = deserializeSingleEvent(stream)

    if (event.type !== "channel") {
      return
    }

    if (this.midiDeviceStore.midiInputRouting === "selectedTrack") {
      // modify channel to the selected track channel
      event.channel = this.channel
    }

    this.player.sendEvent(event)
  }
}
