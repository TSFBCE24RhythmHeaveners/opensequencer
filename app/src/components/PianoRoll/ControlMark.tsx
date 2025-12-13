import styled from "@emotion/styled"
import type { TrackEventRequired } from "@signal-app/core"
import type { ControllerEvent, ProgramChangeEvent } from "midifile-ts"
import { type FC, useMemo } from "react"
import type { TickTransform } from "../../entities/transform/TickTransform"
import { controllerTypeString as CCNames } from "../../helpers/noteNumberString"
import { InstrumentEmoji, InstrumentName } from "../TrackList/InstrumentName"

export type DisplayEvent = TrackEventRequired &
  (ControllerEvent | ProgramChangeEvent)

function ControlName({ event }: { event: DisplayEvent }) {
  switch (event.subtype) {
    case "controller": {
      const name = CCNames(event.controllerType)
      return name || "Control"
    }
    case "programChange":
      return (
        <>
          <InstrumentEmoji programNumber={event.value} isRhythmTrack={false} />{" "}
          <InstrumentName programNumber={event.value} isRhythmTrack={false} />
        </>
      )
    default:
      return "Control"
  }
}

interface ControlMarkProps {
  group: DisplayEvent[]
  transform: TickTransform
  onDoubleClick: () => void
}

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

export const ControlMark: FC<ControlMarkProps> = ({
  group,
  transform,
  onDoubleClick,
}) => {
  const event = group[0]
  const style = useMemo(() => {
    return {
      left: transform.getX(event.tick),
    }
  }, [transform, event.tick])

  return (
    <Container style={style} onDoubleClick={onDoubleClick}>
      <ControlName event={event} />
      {group.length > 1 ? ` +${group.length}` : ""}
    </Container>
  )
}
