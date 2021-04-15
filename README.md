# Easy UK Address Auto Complete 

`@knocode/address-finder` is a JavaScript library which wraps the [Knocode UK Address Finder API](https://rapidapi.com/knocode-knocode-default/api/uk-address-and-postcodes) 
to make creating an autofill address form as simple as possible.

## Quickstart - fast

[Working Demo](https://06tdb.csb.app/)

[Full Code](https://codesandbox.io/s/uk-address-autocomplete-06tdb)

This demo creates a React component using the [Knocode Address API](https://rapidapi.com/knocode-knocode-default/api/uk-address-and-postcodes)  
to show a simple use of this NPM library.

###### Install

Install the npm library in your package.json

`npm install @knocode/address-finder`

###### Setup

Connect the address finder api to your address form.

```javascript 
useEffect(() => {
    AddressFinder.setup({
        inputField: '.input-field',
        onAddressRetrieved: ({ line_1, line_2, line_3, post_town, postcode }) => {
            setAddress({ line_1, line_2, line_3, post_town, postcode })
            setInputLine('')
        },
    })
}, [])
```

This React hook does the following:
* the address-finder library attaches to the onChange event of the address input text field with the class `input-field`
* as text is entered in the text field it is sent to the Knocode address API
* the Knocode API returns a set of suggested addresses that the user might be typing
* the suggested addresses are displayed in a list under the input field by the address-finder library
* when a user selects the required address from the list then the `onAddressRetrieved` callback is invoked
* the `onAddressRetrieved` will return details of the address, these are then set in the components state to be displayed on the form

_This is the just one simple use of the address-finder library, there are many more options which can be used for more complex forms.  Please refer to the API reference below._

###### Test API Key

By default the address-finder uses a test api key when accessing the Knocode address API. 

This api key is for testing purposes only and to make trying out the API as easy as possible.
However, the key is both rate limited, and some addresses returned are fake.  This key cannot be used in production.

Please obtain a free key from [https://rapidapi.com/knocode-knocode-default/api/uk-address-and-postcodes](https://rapidapi.com/knocode-knocode-default/api/uk-address-and-postcodes).
The free key can be used in low usage personal websites and to evaluate the API.

Use your api key in the AddressFinder setup call as shown here:

```javascript 
useEffect(() => {
    AddressFinder.setup({
        apiKey: REPLACE_THIS_WITH_YOUR_API_KEY,
        inputField: '.input-field',
        onAddressRetrieved: ({ line_1, line_2, line_3, post_town, postcode }) => {
            setAddress({ line_1, line_2, line_3, post_town, postcode })
            setInputLine('')
        },
    })
}, [])
```

## Quickstart - address form autofill

[Working Demo](https://csb-krzqp.netlify.app/)

[Full Code](https://codesandbox.io/s/auto-fill-uk-address-form-krzqp)

This demo shows using the [Knocode UK Address Finder API](https://rapidapi.com/knocode-knocode-default/api/uk-address-and-postcodes)
to autofill an address form.

###### The important bits

Connect the address finder api to your address form.

```javascript 
useEffect(() => {
    AddressFinder.setup({
      inputField: "#line_1",
      outputFields: {
        line_1: "#line_1",
        line_2: "#line_2",
        line_3: "#line_3",
        post_town: "#post_town",
        postcode: "#postcode"
      }
    });
  }, []);
```

This React hook does the following:
* the address-finder library attaches to the onChange event of the line_1 input text field
* as text is entered in the text field it is sent to the Knocode address API
* the Knocode API returns a set of suggested addresses that the user might be typing
* the suggested addresses are displayed in a list under the input field by the address-finder library
* when a user selects the required address from the list then `outputFields` configuration is evaluated
* each component of the full address is then assigned to the input field specified

## AddressFinder API

### AddressFinder.setup function

The AddressFinder.setup function is the only function you need to call to use the library.
It takes a `Config` object with the following options.  If an option isn't specified then a 
reasonable default is used.

```typescript

interface Config {
  inputField: HTMLInputElement | string
  apiKey: string
  baseUrl: string
  onAddressRetrieved: OnAddressRetrieved
  listClass: string
  containerClass: string
  outputFields: AddressOutputFields
}

AddressFinder.setup(config: Config)

```
`inputField` (required) - indicates the input text field the library should bind to.  This can be either a HTMLElement or a CSS selector to the input field.

`apiKey` (required for live website) - the api key used to call the [Knocode Address API](https://rapidapi.com/knocode-knocode-default/api/uk-address-and-postcodes).
If no key is specified then a default test key is used.  This test key is
rate limited and will return fake test addresses, and so cannot be used for a live production website.
You can obtain a free API Key with the above link, which is usable for your testing and
small low traffic non-commercial websites.

`baseUrl` (optional) - by default this will use the API exposed via RapidAPI.  Don't change this.

`onAddressRetrieved` (optional) - a callback with the signature below

```typescript
OnAddressRetrieved = (address: Address) => void

type Address = {
  line_1: string
  line_2: string
  line_3: string
  post_town: string
  postcode: string
}
```

When a suggested address is selected, this callback is invoked.  
The callback is passed the components of full address.

`listClass` (optional) - the class name of the HTML UL list which contains the suggested addresses.  
Don't change this unless you want to modify the style used by the suggestion list.

`containerClass` (optional) - the class name for the HTML DIV used to wrap Input Field and the suggestion list.  Don't change this.

`outputFields` (optional) - if specified, then when a suggested address is selected, then the fields specified in the 
outputField Record will be updated with the value from full address.  See the example above.

The outputField Record is defined as:

```typescript
export type SelectorOrElement = string | HTMLElement

export type AddressOutputFields = Partial<Record<keyof Address, SelectorOrElement>>
```

The destinations for the address values in the outputField record can be CSS Selectors or HTMLElements.  
The destination elements are required to be HTMLInputElement, HTMLTextAreaElement, HTMLSpanElement or HTMLParagraphElements.

