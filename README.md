# A broadcast server

## Env
* ```MASTER_HOST``` master http server host
* ```MASTER_KEY``` master http server login key
* ```MASTER_HOOK_PATH``` io-server start up hook path
* ```MASTER_AUTH_PATH``` private channels auth path

## Clients

* [php](https://github.com/gouyuwang/imessage-php)
* [js](https://github.com/gouyuwang/imessage-js)

## Use

```shell
pm2 start
```

or

```shell
npm start
```

## Deploy

nginx

```shell
upstream nodes {
    # enable sticky session with either "hash" (uses the complete IP address)
    hash $remote_addr consistent;
    # or "ip_hash" (uses the first three octets of the client IPv4 address, or the entire IPv6 address)
    # ip_hash;
    # or "sticky" (needs commercial subscription)
    # sticky cookie srv_id expires=1h domain=.example.com path=/;
    server localhost:3000; 
  }


server {
    listen 80;
    server_name sever; # Your domain

    location / {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://nodes;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
}
```
