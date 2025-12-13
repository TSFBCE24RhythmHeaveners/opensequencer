import styled from "@emotion/styled"
import type { TrackEvent } from "@signal-app/core"
import { type FC, useCallback, useMemo } from "react"
import { useEventView } from "../../hooks/useEventView"
import { useTickScroll } from "../../hooks/useTickScroll"
import { Positioned } from "../ui/Positioned"
import { ControlMark, type DisplayEvent } from "./ControlMark"

/// 重なって表示されないようにひとつのイベントとしてまとめる
function groupControlEvents(
  events: DisplayEvent[],
  tickWindow: number,
): DisplayEvent[][] {
  const groups: DisplayEvent[][] = []
  let group: DisplayEvent[] = []
  for (const e of events) {
    if (group.length === 0) {
      group.push(e)
    } else {
      const startTick = events[0].tick
      if (e.tick - startTick < tickWindow) {
        /// 最初のイベントから範囲内ならまとめる
        group.push(e)
      } else {
        /// そうでなければ新しいグループを作る
        groups.push(group)
        group = [e]
      }
    }
  }
  if (group.length > 0) {
    groups.push(group)
  }
  return groups
}

function isDisplayControlEvent(e: TrackEvent): e is DisplayEvent {
  switch ((e as any).subtype) {
    case "controller":
      return false
    case "programChange":
      return true
    default:
      return false
  }
}

export interface PianoControlEventsProps {
  width: number
}

const Container = styled.div`
  height: 24px;
  width: 100%;
  padding: 0.25rem 0;
  position: relative;
`

export const PianoControlEvents: FC<PianoControlEventsProps> = ({ width }) => {
  const events = useEventView()
  const { scrollLeft, transform } = useTickScroll()

  const eventGroups = groupControlEvents(
    events.filter(isDisplayControlEvent),
    120,
  )

  const onDoubleClickMark = useCallback((_group: DisplayEvent[]) => {
    // TODO
  }, [])

  const style = useMemo(
    () => ({
      width,
    }),
    [width],
  )

  return (
    <Container style={style}>
      <Positioned left={-scrollLeft}>
        {eventGroups.map((g) => (
          <ControlMark
            key={g.map((e) => e.id).join("-")}
            group={g}
            transform={transform}
            onDoubleClick={() => onDoubleClickMark(g)}
          />
        ))}
      </Positioned>
    </Container>
  )
}
