import { TrackId } from "@signal-app/core"
import { range } from "lodash"
import { FC, useEffect, useState } from "react"
import { useTrack } from "../../hooks/useTrack"
import { Localized } from "../../localize/useLocalization"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../Dialog/Dialog"
import { Button, PrimaryButton } from "../ui/Button"
import { Label } from "../ui/Label"
import { Select } from "../ui/Select"
import { TextField } from "../ui/TextField"
import { TrackName } from "./TrackName"

export interface TrackDialogProps {
  trackId: TrackId
  open: boolean
  onClose: () => void
}

const ChannelSelect: FC<{
  channel: number | undefined
  onChange: (channel: number) => void
}> = ({ channel, onChange }) => {
  return (
    <Select
      value={channel}
      onChange={(e) => onChange(parseInt(e.target.value as string))}
    >
      {range(0, 16).map((v) => (
        <option key={v} value={v.toString()}>
          {v + 1}
          {v === 9 ? (
            <>
              {" "}
              (<Localized name="rhythm-track" />)
            </>
          ) : (
            ""
          )}
        </option>
      ))}
    </Select>
  )
}

const MIDIInputSelect: FC<{
  channel: number | null
  onChange: (channel: number | null) => void
}> = ({ channel, onChange }) => {
  return (
    <Select
      value={channel ?? -1}
      onChange={(e) => {
        const value = parseInt(e.target.value as string)
        onChange(value === -1 ? null : value)
      }}
    >
      <option key={-1} value={-1}>
        <Localized name="midi-input-all" />
      </option>
      {range(0, 16).map((v) => (
        <option key={v} value={v.toString()}>
          {v + 1}
        </option>
      ))}
    </Select>
  )
}

export const TrackDialog: FC<TrackDialogProps> = ({
  trackId,
  open,
  onClose,
}) => {
  const { name, channel, inputChannel, setName, setChannel, setInputChannel } =
    useTrack(trackId)
  const [_name, _setName] = useState(name)
  const [_channel, _setChannel] = useState(channel)
  const [_midiInputChannel, _setMIDIInputChannel] = useState(
    inputChannel?.value ?? null,
  )

  useEffect(() => {
    if (!open) {
      return
    }
    _setName(name)
    _setChannel(channel)
    _setMIDIInputChannel(inputChannel?.value ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, open])

  return (
    <Dialog open={open} onOpenChange={onClose} style={{ minWidth: "20rem" }}>
      <DialogTitle>
        <Localized name="track" />: <TrackName trackId={trackId} />
      </DialogTitle>
      <DialogContent
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <Label>
          <Localized name="track-name" />
          <TextField
            type="text"
            value={_name}
            onChange={(e) => _setName(e.target.value as string)}
            style={{ width: "100%" }}
          />
        </Label>
        <Label>
          <Localized name="channel" />
          <ChannelSelect channel={_channel} onChange={_setChannel} />
        </Label>
        <Label>
          <Localized name="midi-input" />
          <MIDIInputSelect
            channel={_midiInputChannel}
            onChange={_setMIDIInputChannel}
          />
        </Label>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          <Localized name="cancel" />
        </Button>
        <PrimaryButton
          onClick={() => {
            setName(_name ?? "")
            setChannel(_channel)
            setInputChannel(_midiInputChannel)
            onClose()
          }}
        >
          <Localized name="ok" />
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  )
}
