# Easy UK Address Auto Complete 

`@knocode/address-finder` is a JavaScript library which wraps the [Knocode UK Address Finder API](https://rapidapi.com/knocode-knocode-default/api/uk-address-and-postcodes) 
to make creating an autofill address form as simple as possible.

## Quickstart - fast

[Working Demo](https://06tdb.csb.app/)

[Full Code](https://codesandbox.io/s/uk-address-autocomplete-06tdb)

This demo creates a React component using the [Knocode Address API](https://rapidapi.com/knocode-knocode-default/api/uk-address-and-postcodes)  
to shows the simplist use of this NPM library.

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
* the suggested addresses are displayed in a list underneith the input field by the address-finder library
* when a user selects the required address from the list then the `onAddressRetrieved` callback is invoked
* the `onAddressRetrieved` will return details of the address, these are then set in the components state to be displayed on the form

_This is the simplist possible use of the address-finder library, there are many more options which can be used for more complex forms.  Please refer to the API reference below._

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

