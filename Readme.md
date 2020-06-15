# Intro
Hi, this is small demo with simple CRUD golang server and pure js/html/css client

## How to run
To run this demo just build and run server (`go build`) in server folder. 
Note that server is run on port 80, so if you want to change that replace port
`err := http.ListenAndServe(":80", nil)` 140 line on `main.go` file and `static baseURL = "http://localhost"; ` 177 line in scripts.js on client's side.

Next just open index.html file in client folder, and that's it!