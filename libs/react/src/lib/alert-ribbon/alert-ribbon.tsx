import React, { AriaAttributes, ReactNode, useEffect, useState } from 'react'
import classNames from 'classnames'
import { AlertRibbonType } from '@sebgroup/extract'
import { SquareInfo, SquareExclamation, Check } from '../icons'

export interface AlertRibbonProps {
  children: ReactNode
  type?: AlertRibbonType
  header?: ReactNode
  footer?: ReactNode
  isCloseable?: boolean
  closeText?: string
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void
  role?: 'alert'
  ['aria-live']?: AriaAttributes['aria-live']
  closeAriaLabel?: string
}

export function AlertRibbon({
  type,
  header,
  footer,
  children,
  closeText,
  isCloseable = true,
  onClose,
  role,
  'aria-live': ariaLive,
  closeAriaLabel,
}: AlertRibbonProps) {
  const [closeButton, setCloseButton] = useState<ReactNode>()
  useEffect(() => {
    if (!isCloseable) {
      setCloseButton(null)
    } else {
      if (closeText)
        setCloseButton(
          <button className="close">
            <span className="sr-only">{closeText}</span>
            <i></i>
          </button>
        )
      else
        setCloseButton(
          <button className="close">
            <span className="sr-only">Close</span>
            <i></i>
          </button>
        )
    }
  }, [isCloseable, closeText])

  const renderIcon = () => {
    switch (type) {
      case 'danger':
      case 'warning':
        return <SquareExclamation aria-hidden={true} />
      case 'success':
        return <Check aria-hidden={true} />
      default:
        return <SquareInfo aria-hidden={true} />
    }
  }

  const componentClassnames = classNames(['gds-alert-ribbon', type])

  return (
    <div className={componentClassnames} role={role} aria-live={ariaLive}>
      <i aria-hidden="true">{renderIcon()}</i>
      <div className="gds-alert-ribbon__content">
        {header && React.isValidElement(header) ? (
          header
        ) : (
          <div className="gds-alert-ribbon__heading">{header}</div>
        )}
        <p>{children}</p>
      </div>
      {closeButton && (
        <button
          className="close"
          type="button"
          aria-label={closeAriaLabel ?? 'Close alert'}
          onClick={(event) => {
            onClose && onClose(event)
          }}
        >
          <i></i>
        </button>
      )}
      {footer && <div className="gds-alert-ribbon__footer"> {footer} </div>}
    </div>
  )
}

export default AlertRibbon
