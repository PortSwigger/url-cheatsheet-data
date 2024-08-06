# URL validation bypass cheat sheet data

This is the data that powers the [PortSwigger URL validation bypass cheat sheet](https://portswigger.net/web-security/ssrf/url-validation-bypass-cheat-sheet). We have put this data on Github so the community can contribute vectors via pull requests.

## Contributing

To contribute, please create a pull request with changes to the JSON data.

For example, to add a new payload to the `domain_allow_list_bypass.json` file, use the following template:

```json
{
    "id": "a8512d8ba8fce6459d9254779820a581477766e0",
    "payload": "<attacker>.<allowed>",
    "description": "<attacker>.<allowed>",
    "tags": ["URL", "HOST", "CORS"],
    "filters": []
}
```

- The `id` should be a sha1 hash of the payload.
- The `payload` may include template strings `<attacker>` and `<allowed>`, which will be replaced with corresponding domain names during wordlist generation.
- The `description` property is not processed during execution.
- The `tags` array should only include supported tags: URL, HOST, and CORS. 
- The `filters` array should remain empty as it is intended for future releases with advanced filtering options.

Please make sure you search the data to ensure your vector hasn't already been added.
Please include your Twitter handle in the pull request message if you would like to be credited with it.

## License

The copyright for this project belongs to PortSwigger Web Security. We do not want this data to be used to create derivative cheat sheets hosted elsewhere, so we are not providing a license. That said, you are free to fork this repo in order to create pull requests back.