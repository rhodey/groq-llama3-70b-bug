# groq-llama3-70b-bug
Groq Llama3 70B bug

## Setup
```
npm install
cp example.env .env
export $(cat .env | xargs)
```

## Reproduce
Run test.js then type your question then hit enter. First ask `what is 131313*2?` and see that it fails then ask the question again using the `--alt` option and see that it does not fail.
```
node test.js
node test.js --alt
```

## License
Copyright 2024 - Rhodey
