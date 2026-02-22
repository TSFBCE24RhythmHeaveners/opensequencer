import styled from "@emotion/styled"
import type { TrackEventOf } from "@signal-app/core"
import type { ProgramChangeEvent } from "midifile-ts"
import { type FC, useCallback, useMemo, useState } from "react"
import type { TickTransform } from "../../entities/transform/TickTransform"
import { usePianoRoll } from "../../hooks/usePianoRoll"
import { useTrack } from "../../hooks/useTrack"
import { InstrumentBrowser } from "../InstrumentBrowser/InstrumentBrowser"
import { InstrumentEmoji, InstrumentName } from "../TrackList/InstrumentName"

const Container = styled.div`
  position: absolute;
  white-space: nowrap;
  background: var(--color-theme);
  color: var(--color-text);
  padding: 0.2em 0.5em;
  border-radius: 0 4px 4px 0;
  margin: 0.2em 0 0 0;
  box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.02);
  transition: all 0.1s ease;
  opacity: 0.5;
  max-width: 7rem;
  overflow: hidden;

  &:hover {
    opacity: 1;
    transform: scale(1.05);
    border-radius: 4px;
  }
`

export const InstrumentMark: FC<{
  event: TrackEventOf<ProgramChangeEvent>
  transform: TickTransform
}> = ({ event, transform }) => {
  const style = useMemo(() => {
    return {
      left: transform.getX(event.tick),
    }
  }, [transform, event.tick])
  const [isOpenInstrumentBrowser, setIsOpenInstrumentBrowser] = useState(false)
  const { selectedTrackId } = usePianoRoll()
  const { removeEvent } = useTrack(selectedTrackId)

  const handleClick = useCallback(() => {
    setIsOpenInstrumentBrowser(true)
  }, [])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      removeEvent(event.id)
    },
    [event.id, removeEvent],
  )

  return (
    <>
      <Container style={style} onClick={handleClick} onContextMenu={handleContextMenu}>
        <InstrumentEmoji programNumber={event.value} isRhythmTrack={false} />{" "}
        <InstrumentName programNumber={event.value} isRhythmTrack={false} />
      </Container>
      <InstrumentBrowser
        isOpen={isOpenInstrumentBrowser}
        onOpenChange={setIsOpenInstrumentBrowser}
        trackId={selectedTrackId}
        targetEventId={event.id}
      />
    </>
  )
}
