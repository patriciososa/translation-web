'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ChatMessage } from './chat-message'
import type { ChatMessage as ChatMessageModel } from '@/types/chat'

/** Rounding slack, so a scroll position a pixel or two short still counts as the bottom. */
const BOTTOM_TOLERANCE_PX = 24

// Primary rather than navy: the dark theme's navy (#141d38) sits at 1.08:1
// against the panel this floats over (#111624), so the pill was all but
// invisible in the very case it exists for. Primary is the token built to carry
// a label on either surface — 6.4:1 in dark, 5.2:1 in light, with its own label
// colour passing AA both ways — and it matches the launcher button, so the pill
// reads as the thing to press.
const JUMP_BUTTON_CLASS =
  'absolute inset-x-0 bottom-3 mx-auto flex w-max cursor-pointer items-center gap-2 ' +
  'rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary shadow-lifted ' +
  'transition-colors duration-150 hover:bg-primary-hover active:bg-primary-pressed ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export function MessageList({ messages }: { messages: ChatMessageModel[] }) {
  const t = useTranslations('chat')
  const containerRef = useRef<HTMLDivElement>(null)
  // Tracked from scroll events rather than measured once the new messages are
  // already rendered: freshly inserted bubbles push the bottom away, and a run
  // of them would otherwise look like the reader had scrolled off on purpose.
  const followBottom = useRef(true)
  // How many messages have already been accounted for, so each render only
  // looks at what arrived since the last one.
  const seen = useRef(messages.length)
  // Replies that landed while the reader was up in the history. Scrolling back
  // used to hide them completely — the view stays where it is, the panel shows
  // no sign anything happened, and customers sat waiting on an answer that was
  // already on screen a few hundred pixels below.
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight
      followBottom.current = distanceFromBottom <= BOTTOM_TOLERANCE_PX
      // Reading them is what marks them read; scrolling back down by hand
      // counts just as much as pressing the button.
      if (followBottom.current) setUnread(0)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Follow new messages only while the reader is at the bottom, so scrolling
  // back through the conversation is never interrupted.
  //
  // This has to be a layout effect: the browser dispatches scroll events on a
  // later frame, so with a passive effect the scroll from one message can land
  // after the next message is already in the DOM. The handler above would then
  // measure a bottom that the new bubble had already pushed away and clear
  // followBottom, stranding the final message of a back-to-back run off-screen.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (container === null) return

    // A shorter list means the conversation was replaced rather than extended
    // (the session expired and the socket handed back a fresh history): there
    // is nothing unread in a conversation the reader has not started yet.
    const replaced = messages.length < seen.current
    const arrived = replaced ? [] : messages.slice(seen.current)
    seen.current = messages.length

    if (replaced) {
      followBottom.current = true
      container.scrollTop = container.scrollHeight
      setUnread(0)
      return
    }

    // The customer's own message always pulls the view down with it: they just
    // wrote it, and answering from the middle of the history would otherwise
    // leave them looking at an old part of the conversation.
    if (followBottom.current || arrived.some((message) => message.sender === 'customer')) {
      followBottom.current = true
      container.scrollTop = container.scrollHeight
      setUnread(0)
      return
    }

    const fromOperator = arrived.filter((message) => message.sender !== 'customer').length
    if (fromOperator > 0) setUnread((count) => count + fromOperator)
  }, [messages])

  const jumpToLatest = () => {
    const container = containerRef.current
    if (container === null) return
    followBottom.current = true
    setUnread(0)
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={containerRef} className="h-full overflow-y-auto px-4 py-6 sm:px-6">
        <ul aria-label={t('conversation')} role="log" aria-live="polite" className="flex flex-col gap-3">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </ul>
      </div>

      {unread > 0 && (
        <button
          type="button"
          onClick={jumpToLatest}
          className={JUMP_BUTTON_CLASS}
        >
          <ArrowDown aria-hidden="true" className="size-4" />
          {t('newMessages', { count: unread })}
        </button>
      )}
    </div>
  )
}
