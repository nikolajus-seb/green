import { LitElement, html, unsafeCSS } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { customElement } from 'lit/decorators.js'
import { createRef, ref, Ref } from 'lit/directives/ref.js'
import { createComponent } from '@lit-labs/react'
import * as React from 'react'
import 'reflect-metadata'

import { randomId, constrainSlots } from '../../tools/utils'

import { GdsListbox, GdsOption } from '../listbox/index'
import { GdsPopover } from '../popover/popover'

import styles from './stem.styles.scss'

/**
 * @element gds-dropdown
 *
 * A dropdown consist of a trigger button and a list of selectable options. It is used to select a single value from a list of options.
 *
 * @slot - Options for the dropdown. Accepts `gds-option` elements.
 * @slot button - The trigger button for the dropdown. Custom content for the button can be assigned through this slot.
 * @fires change - Fired when the value of the dropdown changes.
 * @fires ui-state - Fired when the dropdown is opened or closed.
 */
@customElement('gds-dropdown')
export class GdsDropdown extends LitElement {
  static styles = unsafeCSS(styles)
  static formAssociated = true

  static properties = {
    open: { type: Boolean, reflect: true },
    value: { reflect: false },
  }

  /**
   * Sets the open state of the dropdown.
   */
  open = false

  /**
   * The value of the dropdown.
   */
  value: any

  // Private members
  #internals: ElementInternals
  #listBoxRef: Ref<GdsListbox> = createRef()
  #triggerRef: Ref<HTMLButtonElement> = createRef()
  #optionElements: HTMLCollectionOf<GdsOption>
  #listboxId = randomId()

  constructor() {
    super()
    this.#internals = this.attachInternals()
    constrainSlots(this)

    this.#optionElements = this.getElementsByTagName(
      'gds-option'
    ) as HTMLCollectionOf<GdsOption>
  }

  /**
   * @returns The list of options in the dropdown.
   * @readonly
   */
  get values() {
    return Array.from(this.#optionElements).map((o) => ({
      option: o,
      selected: this.value === o.value,
    }))
  }

  connectedCallback(): void {
    super.connectedCallback()
    this.#internals.setFormValue(this.value)
    this.value = this.value || this.values[0].option.value
  }

  render() {
    return html`
      <button
        @click="${() => this.setOpen(!this.open)}"
        aria-haspopup="listbox"
        role="combobox"
        aria-owns="${this.#listboxId}"
        aria-controls="${this.#listboxId}"
        aria-expanded="${this.open}"
        ${ref(this.#triggerRef)}
      >
        <slot name="button" gds-allow="span">
          <span
            >${unsafeHTML(
              this.values.find((v) => v.selected)?.option.innerHTML
            )}
          </span>
        </slot>
      </button>
      <gds-popover
        .open=${this.open}
        @ui-state=${(e: CustomEvent) => this.setOpen(e.detail.open)}
        ${ref(this.registerPopoverTrigger)}
      >
        <input type="text" @keydown=${this.filterOptions} />
        <gds-listbox
          id="${this.#listboxId}"
          ${ref(this.#listBoxRef)}
          @select="${(e: CustomEvent) =>
            this.selectOption(e.target as GdsOption)}"
          ><slot gds-allow="gds-option"></slot
        ></gds-listbox>
      </gds-popover>
    `
  }

  /**
   * Event handler for filtering the options in the dropdown.
   * Arrow down key will move focus to the listbox.
   *
   * @param e The keyboard event.
   */
  private filterOptions = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      this.#listBoxRef.value?.focus()
      return
    }
    const input = e.target as HTMLInputElement
    const options = Array.from(this.#optionElements)
    const filteredOptions = options.filter((o) =>
      o.innerHTML.toLowerCase().includes(input.value.toLowerCase())
    )
    filteredOptions.forEach((o) => (o.hidden = false))
  }

  /**
   * Registers the trigger button of the dropdown to the popover.
   *
   * @param el The popover element.
   */
  private registerPopoverTrigger(el?: Element) {
    if (el) {
      const popover = el as GdsPopover
      popover.trigger = this.#triggerRef.value as HTMLButtonElement
    }
  }

  /**
   * Selects an option in the dropdown.
   *
   * @param option The option to select.
   * @fires change
   */
  private selectOption(option: GdsOption) {
    console.log('selectOption', option)
    this.value = option.value
    this.#internals.setFormValue(option.value)
    this.setOpen(false)
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: option.value },
        bubbles: true,
        composed: true,
      })
    )
  }

  /**
   * Sets the open state of the dropdown.
   *
   * @param open The open state.
   * @fires ui-state
   */
  private setOpen(open: boolean) {
    this.open = open
    this.#internals.ariaExpanded = open.toString()

    if (open) this.registerAutoCloseListener()
    else this.unregisterAutoCloseListener()

    this.dispatchEvent(
      new CustomEvent('ui-state', {
        detail: { open },
        bubbles: true,
        composed: true,
      })
    )
  }

  private registerAutoCloseListener() {
    window.addEventListener('click', this.autoCloseListener)
    window.addEventListener('keyup', this.autoCloseListener)
  }

  private unregisterAutoCloseListener() {
    window.removeEventListener('click', this.autoCloseListener)
    window.removeEventListener('keyup', this.autoCloseListener)
  }

  /**
   * A listener to close the dropdown when clicking outside of it,
   * or when any other element recieves a keyup event.
   */
  private autoCloseListener = (e: Event) => {
    if (e.target instanceof Node && !this.contains(e.target as Node))
      this.setOpen(false)
  }
}

export const GdsDropdownReact = createComponent({
  tagName: 'gds-dropdown',
  elementClass: GdsDropdown,
  react: React,
})
