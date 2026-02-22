import {
  NoteEvent,
  TrackEvent,
  TrackId,
} from "@signal-app/core"
import { Player } from "@signal-app/player"
import { deserializeSingleEvent, Stream } from "midifile-ts"
import { makeObservable, observable, observe } from "mobx"
import { SongStore } from "../stores/SongStore"

export class MIDIRecorder {
  private recordedNotes: { [key: TrackId]: NoteEvent[] } = {}
  isRecording: boolean = false

  constructor(
    private readonly songStore: SongStore,
    private readonly player: Player,
  ) {
    makeObservable(this, {
      isRecording: observable,
    })

    // extend duration while key press
    observe(player, "position", (change) => {
      if (!this.isRecording) {
        return
      }

      const tick = Math.floor(change.object.get())

      Object.entries(this.recordedNotes).forEach(([trackId, notes]) => {
        const track = this.songStore.song.getTrack(parseInt(trackId) as TrackId)
        if (track === undefined) {
          return
        }
        notes.forEach((n) => {
          track.updateEvent<NoteEvent>(n.id, {
            duration: Math.max(0, tick - n.tick),
          })
        })
      })
    })

    observe(this, "isRecording", (change) => {
      this.recordedNotes = {}

      if (!change.newValue) {
        // stop recording
        this.songStore.song.tracks.forEach((track) => {
          const events = track.events
            .filter((e) => e.isRecording === true)
            .map<Partial<TrackEvent>>((e) => ({ ...e, isRecording: false }))
          track.updateEvents(events)
        })
      }
    })
  }

  onMessage(e: WebMidi.MIDIMessageEvent) {
    if (!this.isRecording) {
      return
    }

    const stream = new Stream(e.data)
    const message = deserializeSingleEvent(stream)

    if (message.type !== "channel") {
      return
    }

    const tick = Math.floor(this.player.position)

    // route to tracks by input channel
    const tracks = this.songStore.song.tracks.filter(
      (t) =>
        !t.isConductorTrack &&
        (t.inputChannel === undefined ||
          t.inputChannel.value === message.channel),
    )

    switch (message.subtype) {
      case "noteOn": {
        tracks.forEach((track) => {
          const note = track.addEvent<NoteEvent>({
            type: "channel",
            subtype: "note",
            noteNumber: message.noteNumber,
            tick,
            velocity: message.velocity,
            duration: 0,
            isRecording: true,
          })
          if (this.recordedNotes[track.id] === undefined) {
            this.recordedNotes[track.id] = []
          }
          this.recordedNotes[track.id].push(note)
        })
        break
      }
      case "noteOff": {
        tracks.forEach((track) => {
          const recordedNotes = this.recordedNotes[track.id] ?? []

          recordedNotes
            .filter((n) => n.noteNumber === message.noteNumber)
            .forEach((n) => {
              track.updateEvent<NoteEvent>(n.id, {
                duration: Math.max(0, tick - n.tick),
              })
            })

          this.recordedNotes[track.id] = recordedNotes.filter(
            (n) => n.noteNumber !== message.noteNumber,
          )
        })
        break
      }
      default: {
        tracks.forEach((track) => {
          track.addEvent({ ...message, tick, isRecording: true })
        })
        break
      }
    }
  }
}
