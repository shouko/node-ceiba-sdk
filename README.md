NTU CEIBA Node.js SDK
============================

NTU CEIBA is the official learning management system of National Taiwan University.
Students and teachers at NTU rely on the system heavily.
We would love to enhance the experience for the system by exploring new ways to interact with it.<br>
Since CEIBA has a slightly old code base and no public API available, by simulating users' behavior, we may be able to build an unofficial SDK for CEIBA.
We did some study on the official CEIBA Android app, and implemented some important part using Node.js.

#### Notice
This project is at a very early stage of development, many features may not work properly, please don't use the code in production.<br>

## Getting Started

    npm install ceiba-sdk

## Usage

```js
var Ceiba = require('ceiba-sdk')
var ceiba = new Ceiba('NTU_USERNAME', 'NTU_PASSWORD', function(err) {
  if(!err) {
    // connected
  }
});
```

```js
// fetches semester data asynchronously, returns a Promise
// note that semester[0], which is the latest semester, is fetched automatically upon login
ceiba.semseter[4].fetch();

// prints courses in designated semester
console.log(ceiba.semester[4].courses);

// fetches detailed course data asynchronously, returns a Promise
ceiba.semester[4].courses[0].fetch();

// prints detailed data includes content files, bulletin, homeworks, grades
console.log(ceiba.semester[4].courses[0]);

// fetches discussion boards list for the course asynchronously, returns a Promise
ceiba.semester[4].courses[0].fetch_boards();
```

## License

[MIT License](LICENSE)
