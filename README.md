# groq-llama3-70b-bug
Groq Llama3 70B bug

## Setup
```
npm install
cp example.env .env
export $(cat .env | xargs)
```

## Reproduce
Run test.js then type your question then hit enter. First ask `what is 131313*2?` and see that it fails then ask the question again using the `--alt` option and see that it does not fail. The difference between no alt and alt is that no alt [uses this prompt](https://github.com/rhodey/groq-llama3-70b-bug/blob/8f9065f98ad0cdccf29569f7b6b14534290bf21a/math.js#L5) and alt [uses this prompt](https://github.com/rhodey/groq-llama3-70b-bug/blob/8f9065f98ad0cdccf29569f7b6b14534290bf21a/math.js#L27).
```
node test.js
node test.js --alt
```

## Additional
Git checkout branch `auto` to see that this failure relates to attempting to force a function call by name and that [function_call: auto](https://github.com/rhodey/groq-llama3-70b-bug/blob/auto/test.js#L61) does not fail.

## License
Copyright 2024 - Rhodey
