FROM golang:alpine

RUN apk add --no-cache git && \
    go get -v github.com/gin-gonic/gin && \
    go get -v github.com/gin-contrib/cors && \
    go get -v github.com/mssola/user_agent && \
    go get -v github.com/pkg/errors && \
    go get -v github.com/go-pg/pg

WORKDIR /go/src/app

COPY . .
RUN go install -v ./...
USER nobody

CMD ["app"]
