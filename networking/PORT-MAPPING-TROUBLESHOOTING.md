# Docker Port Mapping: Troubleshooting

## 1. The Website Does Not Open

Check that the container is running:

```bash
docker ps
```

Check its published ports:

```bash
docker port CONTAINER
```

Check the container logs:

```bash
docker logs CONTAINER
```

Make sure you visit the host port. If you started the container with `-p 8080:80`, open `http://localhost:8080`.

## 2. The Application Listens on `127.0.0.1`

If the application listens only on `127.0.0.1` inside the container, it may accept connections only through the container's own loopback interface.

For a typical web application that needs to accept connections through the container network, configure it to listen on a suitable address such as `0.0.0.0`.

Node.js example:

```javascript
server.listen(3000, "0.0.0.0");
```

Remember that `127.0.0.1` inside a container is different from `127.0.0.1` on the host.

## 3. The Host Port Is Already in Use

If another process or container already uses the requested host port, Docker may report a port allocation error.

Choose another host port:

```bash
docker run -d -p 8081:80 nginx
```

On Linux, inspect listening ports:

```bash
sudo ss -lntp
```

## 4. The Port Was Never Published

This Dockerfile instruction:

```dockerfile
EXPOSE 3000
```

does not publish the port on the host.

Use:

```bash
docker run -p 3000:3000 my-app
```

For an existing container, you generally need to recreate it with the desired port publishing option.

## 5. The Wrong Container Port Was Published

Suppose your application listens on container port `3000`.

This mapping is likely incorrect:

```bash
docker run -p 8080:80 my-app
```

It forwards host port `8080` to container port `80`, not `3000`.

Use:

```bash
docker run -p 8080:3000 my-app
```

The right-hand port must match the port on which the application listens inside the container.

## 6. The Host Address Binding Is Too Restrictive

This command publishes the port on the host's loopback interface:

```bash
docker run -p 127.0.0.1:8080:80 nginx
```

It is intended for host-local access. Another machine generally cannot access the service through the host's LAN IP using this binding.

To publish on all host IPv4 interfaces:

```bash
docker run -p 0.0.0.0:8080:80 nginx
```

Only do this when external access is intended. Firewall rules and network routing still affect reachability.

## 7. Firewall or Network Restrictions

If the mapping and application are correct but remote clients cannot connect, check:

- Host firewall rules.
- Cloud or virtual-machine firewall rules, if applicable.
- Network routing and host reachability.
- Whether the service is bound to the expected address.

A successful connection from the host itself does not guarantee remote devices can connect.

## 8. Diagnostic Checklist

Follow this order:

1. Is the container running? Run `docker ps`.
2. Is the expected port published? Run `docker port CONTAINER`.
3. Is the app listening on the correct container port?
4. Is it listening on an address reachable through the container network?
5. Are you using the host port in the browser or client?
6. Is the host port already occupied? Check with `sudo ss -lntp`.
7. Are firewall rules or remote network restrictions blocking access?

## Key Takeaways

- Check the mapping, application port, and listening address first.
- `EXPOSE` alone does not publish a host port.
- `localhost` refers to the machine or container from which the connection is made.
- A port bound to host `127.0.0.1` is intended for local host access.
- Avoid exposing development services or databases to untrusted networks.