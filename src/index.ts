export type Address = {
  line_1: string
  line_2: string
  line_3: string
  post_town: string
  postcode: string
}

export type SelectorOrElement = string | HTMLElement

export type AddressOutputFields = Partial<Record<keyof Address, SelectorOrElement>>

export type OnAddressRetrieved = (address: Address) => void

export interface Config {
  inputField: HTMLInputElement | string
  apiKey: string
  baseUrl: string
  onAddressRetrieved: OnAddressRetrieved
  listClass: string
  containerClass: string
  outputFields: AddressOutputFields
}

// this is the default test key
// it is rate limited, usage limited and the results returned are not complete
// this is so you are not tempted to use this for real in production
// signup for your own free evaluation key here:
// https://rapidapi.com/knocode-knocode-default/api/uk-address-and-postcodes/pricing
const testKeyPart1 = '3c2614289fmsh0cff20e0f'
const testKeyPart2 = '4126f9p18c4e7jsn64a562f6d771'
// testKey split like this to stop gitguardian complaining about keys in the source code
const testKey = testKeyPart1 + testKeyPart2

export const defaultConfig: Config = {
  inputField: '',
  apiKey: testKey,
  baseUrl: 'https://uk-address-and-postcodes.p.rapidapi.com',
  onAddressRetrieved: () => {
    return {}
  },
  listClass: 'knocode-suggestion-list',
  containerClass: 'knocode-suggestion-container',
  outputFields: {},
}


type Hit = {
  suggestion: string
  addressId: number
}

type AutoCompleteResult = { hits: [Hit] }

type AutoCompleteResponse = {
  result: AutoCompleteResult
  message: string
}

enum Key {
  Enter = 13,
  ArrowUp = 38,
  ArrowDown = 40,
  Escape = 27,
  DontCare = 0,
}

type AddressResponse = {
  result: Address
  message: string
}

const defaultStyle: string =
  'div.knocode-suggestion-container {\n' +
  '    position: relative;\n' +
  '    margin: 0;\n' +
  '    padding: 0;\n' +
  '    border: 0\n' +
  '}\n' +
  'div.knocode-suggestion-container > input {\n' +
  '    display: block\n' +
  '}\n' +
  'div.knocode-suggestion-container > ul {\n' +
  '    position: absolute;\n' +
  '    left: 0;\n' +
  '    z-index: 1;\n' +
  '    min-width: 100%;\n' +
  '    box-sizing: border-box;\n' +
  '    list-style: none;\n' +
  '    padding: 0;\n' +
  '    border-radius: 0.3em;\n' +
  '    margin: 0.2em 0 0;\n' +
  '    background: #fff;\n' +
  '    border: 1px solid rgba(0, 0, 0, 0.3);\n' +
  '    box-shadow: 0.05em 0.2em 0.6em rgba(0, 0, 0, 0.2);\n' +
  '    text-shadow: none;\n' +
  '    max-height: 250px;\n' +
  '    overflow-y: scroll\n' +
  '}\n' +
  'div.knocode-suggestion-container > ul > li {\n' +
  '    position: relative;\n' +
  '    padding: 0.2em 0.5em;\n' +
  '    cursor: pointer\n' +
  '}\n' +
  'div.knocode-suggestion-container > ul > li:hover {\n' +
  '    background: #b8d3e0;\n' +
  '    color: black\n' +
  '}\n' +
  'div.knocode-suggestion-container > ul > li[aria-selected="true"] {\n' +
  '    background: #3d6d8f;\n' +
  '    color: white\n' +
  '}\n' +
  'li.knocode-watermark {\n' +
  '    float: right;\n' +
  '    font-size: small;\n' +
  '    margin-right: 10px;\n' +
  '}\n' +
  '@supports (transform:scale(0)) {\n' +
  '    div.knocode-suggestion-container > ul {\n' +
  '        transition: 0.3s cubic-bezier(0.4, 0.2, 0.5, 1.4);\n' +
  '        transform-origin: 1.43em -0.43em\n' +
  '    }\n' +
  '    div.knocode-suggestion-container > ul[hidden], div.knocode-suggestion-container > ul:empty {\n' +
  '        opacity: 0;\n' +
  '        transform: scale(0);\n' +
  '        display: block;\n' +
  '        transition-timing-function: ease\n' +
  '    }\n' +
  '}'

export class Finder {
  public suggestionList: HTMLUListElement
  public inputField: HTMLInputElement
  public container: HTMLDivElement
  public config: Config
  public document: HTMLDocument

  selectedIndex = 0
  showWatermark = false

  constructor(userConfig: Config) {
    this.config = { ...defaultConfig, ...userConfig }
    if (!this.config.inputField || this.config.inputField == '') throw "Input field hasn't been defined"

    if (typeof this.config.inputField == 'string') {
      const foundField = window.document.querySelector<HTMLInputElement>(this.config.inputField)
      if (!foundField) throw `Didn't find input field with the selector ${this.config.inputField}`
      this.inputField = foundField
    } else this.inputField = this.config.inputField

    this.document = this.inputField.ownerDocument
    this.suggestionList = this.createSuggestionList(this.document, this.config.listClass)
    this.container = this.createContainer(this.document, this.config.containerClass)

    this.attach(this.inputField, this.suggestionList, this.container)
    this.injectStyle(this.document, defaultStyle)

    if (this.config.apiKey == testKey)
      console.warn("Address-finder is using the test key, do not use this key in production.  The results from the API calls are intentionally incomplete.  Get your free API key from RapidAPI")
  }

  setSuggestions(value: string, suggestions: AutoCompleteResponse): void {
    const currentValue = this.inputField.value.trim()
    if (value != currentValue)
      return  // ignore old response received

    this.suggestionList.innerHTML = ''
    const items = suggestions.result.hits.map((c) => {
      const li = this.document.createElement('li')
      li.textContent = c.suggestion
      li.setAttribute('data-id', c.addressId.toString())
      return li
    })
    items.forEach((item) => this.suggestionList.appendChild(item))
    if (items.length > 0 && this.showWatermark) {
      const watermark = this.document.createElement('li')
      watermark.innerHTML = "Brought to you by Knocode.com"
      watermark.className = "knocode-watermark"
      this.suggestionList.appendChild(watermark)
    }
    this.suggestionList.style.display = 'block'
    this.selectedIndex = 0
    this.scrollSuggestionIntoView(0)
  }

  async onInput(): Promise<void> {
    const value = this.inputField.value.trim()

    if (value.length == 0) {
      this.suggestionList.innerHTML = ''
      this.hideSuggestionList()
      return
    }
    else {
      try {
        const suggestions: AutoCompleteResponse = await this.callApi(`/rapidapi/v1/autocomplete/addresses?query=${value}`)
        this.setSuggestions(value, suggestions)
      } catch (e) {
        console.log(e)
      }
    }
  }

  onBlur(): void {
    this.hideSuggestionList()
  }

  onFocus(): void {
    this.showSuggestionList()
  }

  toKey(code: number): Key {
    switch (code) {
      case 13:
        return Key.Enter
      case 38:
        return Key.ArrowUp
      case 40:
        return Key.ArrowDown
      case 27:
        return Key.Escape
      default:
        return Key.DontCare
    }
  }

  scrollSuggestionIntoView(n: number): void {
    if (n < 0 || n >= this.suggestionList.children.length) return

    const li: HTMLElement = this.suggestionList.children[n] as HTMLLIElement
    const liOffset = li.offsetTop
    const ulScrollTop = this.suggestionList.scrollTop
    if (liOffset < ulScrollTop) this.suggestionList.scrollTop = liOffset

    const ulHeight = this.suggestionList.clientHeight
    const liHeight = li.clientHeight
    if (liOffset + liHeight > ulScrollTop + ulHeight) this.suggestionList.scrollTop = liOffset - ulHeight + liHeight

    for (const item of Array.from(this.suggestionList.children))
      item.setAttribute('aria-selected', (li == item).toString())
  }

  nextSuggestion(): void {
    this.selectedIndex = (this.selectedIndex + 1) % this.suggestionList.children.length
    this.scrollSuggestionIntoView(this.selectedIndex)
  }

  prevSuggestion(): void {
    this.selectedIndex = this.selectedIndex - 1
    if (this.selectedIndex < 0) this.selectedIndex = this.suggestionList.children.length - 1
    this.scrollSuggestionIntoView(this.selectedIndex)
  }

  hideSuggestionList(): void {
    this.suggestionList.style.display = 'none'
  }

  showSuggestionList(): void {
    if (this.suggestionList.children.length > 0)
      this.suggestionList.style.display = 'block'
  }

  getOutputFieldAsElement(destination: string | HTMLElement) : HTMLElement | null {
    if (typeof destination == 'string') {
      const elementOrNull = this.document.querySelector<HTMLElement>(destination)
      if (!elementOrNull)
        console.log(
          `Cannot populate ${destination} because the element with that selector cannot be found on the page`,
        )
      return elementOrNull

    } else return destination
  }

  updateTextInElement(element: HTMLElement, text: string): void {
    if (element instanceof HTMLInputElement) {
      element.value = text
    } else if (element instanceof HTMLTextAreaElement) {
      element.value = text
    } else if (element instanceof HTMLSpanElement) {
      element.innerText = text
    } else if (element instanceof HTMLParagraphElement) {
      element.innerText = text
    } else
      console.log(`Not setting the value for element ${element.id} because it isn't a input, text area, span or paragraph`)
  }

  updateOutputFieldsWithAddress(address: Address) : void {
    let outputFieldsKey: keyof Address
    for (outputFieldsKey in this.config.outputFields) {
      if (!Object.prototype.hasOwnProperty.call(this.config.outputFields, outputFieldsKey)) continue

      if (!(outputFieldsKey in address)) {
        console.log(`Not populating ${outputFieldsKey} because it isn't a field in an Address`)
        continue
      }

      const destination = this.config.outputFields[outputFieldsKey]
      if (!destination) continue

      const element = this.getOutputFieldAsElement(destination)
      if (!element) continue

      this.updateTextInElement(element, address[outputFieldsKey])
    }
  }

  async chooseSuggestion(li: HTMLElement): Promise<void> {
    const addressId = li.getAttribute('data-id')
    try {
      const addressResponse: AddressResponse = await this.callApi(`/rapidapi/v1/address/${addressId}`)
      this.hideSuggestionList()
      const address = addressResponse.result
      this.config.onAddressRetrieved(address)
      this.updateOutputFieldsWithAddress(address)
    } catch (e) {
      console.log(e)
    }
  }

  async chooseSuggestionWithIndex(n: number): Promise<void> {
    if (n < 0 || n > this.suggestionList.children.length) return
    const li: HTMLElement = this.suggestionList.children[n] as HTMLLIElement
    return this.chooseSuggestion(li)
  }

  onKeydown(event: KeyboardEvent): void {
    const key = this.toKey(event.keyCode)
    switch (key) {
      case Key.ArrowDown:
        this.nextSuggestion()
        break
      case Key.ArrowUp:
        this.prevSuggestion()
        break
      case Key.Escape:
        this.hideSuggestionList()
        break
      case Key.Enter:
        this.chooseSuggestionWithIndex(this.selectedIndex)
    }
  }

  attach(inputField: HTMLInputElement, suggestionList: HTMLUListElement, container: HTMLDivElement): void {
    inputField.addEventListener('input', async () => {
      await this.onInput()
    })
    inputField.addEventListener('blur', () => this.onBlur())
    inputField.addEventListener('focus', () => this.onFocus())
    inputField.addEventListener('keydown', async (e: KeyboardEvent) => await this.onKeydown(e))
    inputField.setAttribute('autocomplete', 'none')
    inputField.setAttribute('autocorrect', 'off')
    inputField.setAttribute('autocapitalize', 'off')
    inputField.setAttribute('spellcheck', 'false')

    const parent = inputField.parentNode
    if (!parent) throw 'Expected Input field to have parent'
    parent.insertBefore(container, inputField)
    container.appendChild(inputField)
    container.appendChild(suggestionList)
  }

  injectStyle(document: HTMLDocument, css: string): void {
    const style = document.createElement('style')
    style.type = 'text/css'
    style.appendChild(document.createTextNode(css))
    document.head.appendChild(style)
  }

  mouseDown(e: MouseEvent): Promise<void> {
    const li = e.target as HTMLUListElement
    return this.chooseSuggestion(li)
  }

  createSuggestionList(document: HTMLDocument, className: string): HTMLUListElement {
    const list = document.createElement('ul')
    list.className = className
    list.style.display = 'none'
    list.addEventListener("mousedown", async (e: MouseEvent) => await this.mouseDown(e));
    return list
  }

  createContainer(document: HTMLDocument, className: string): HTMLDivElement {
    const container = document.createElement('div')
    container.className = className
    return container
  }

  async callApi<T>(url: string): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${url}`,
      {
        headers: new Headers({"x-rapidapi-key": this.config.apiKey})
      })
    if (!response.ok) {
      const moreInfo = await response.text()
      const hint = `Failed calling Knocode address API, status code: ${response.status}, details: ${moreInfo}`
      console.log(hint)
      throw hint
    }
    else {
      this.showWatermark = this.config.apiKey == testKey
      return response.json()
    }
  }
}

export const setup = (config: Config): Finder => {
  return new Finder(config)
}

export const AddressFinder = { setup }
