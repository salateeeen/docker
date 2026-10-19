# Docker Port Publishing

## 1. Publishing Ports with `-p`

The `-p` or `--publish` option publishes a container port on the host.

```bash
docker run -d -p 8080:80 nginx
```

You can publish multiple ports:

```bash
docker run -d \
  -p 8080:80 \
  -p 8443:443 \
  nginx
```

## 2. Binding to a Specific Host Address

Publish the port on the host's loopback interface:

```bash
docker run -d -p 127.0.0.1:8080:80 nginx
```

This is useful when the service should be accessible from your host but not directly exposed through its external network interfaces.

Publish on all host(loopback, nic, wifi) IPv4 interfaces:

```bash
docker run -d -p 0.0.0.0:8080:80 nginx
```

- `127.0.0.1`: Host loopback interface.
- `0.0.0.0`: All host IPv4 interfaces.

Publishing on all interfaces may expose the service to other machines, depending on routing and firewall rules.

## 3. `-p` vs. `-P`

### `-p`: Choose the host port

```bash
docker run -d -p 8080:80 nginx
```

Host port `8080` forwards to container port `80`.

### `-P`: Assign host ports automatically

```bash
docker run -d -P nginx
```

Docker publishes the image's exposed ports using automatically assigned host ports.

Inspect the assigned ports:

```bash
docker ps
docker port CONTAINERN_NAME/ID
```

## 4. `EXPOSE` vs. `-p`

A Dockerfile may contain:

```dockerfile
EXPOSE 3000
```

`EXPOSE` documents the port the application is expected to use. It does not, by itself, publish the port on the host.

To publish it:

```bash
docker run -p 3000:3000 my-app
```

Remember:

- `EXPOSE` documents a container port.
- `-p` publishes a specific port on the host.
- `-P` publishes exposed ports using automatically assigned host ports.

## 5. Multiple Containers and Port Conflicts

Different containers can listen on the same container port because they have separate network namespaces.

```bash
docker run -d --name web1 -p 8080:80 nginx
docker run -d --name web2 -p 8081:80 nginx
```

Both containers use container port `80`, but their host ports differ.

If two containers attempt to publish the same host port on the same host address, Docker will normally report a port allocation error.

## Quick Reference

| Option | Purpose |
|---|---|
| `-p 8080:80` | Publish host port 8080 to container port 80 |
| `-p 127.0.0.1:8080:80` | Publish on host loopback |
| `-p 0.0.0.0:8080:80` | Publish on all host IPv4 interfaces |
| `-P` | Publish exposed ports on assigned host ports |
| `EXPOSE 3000` | Document the intended container port |