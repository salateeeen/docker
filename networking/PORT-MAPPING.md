# Docker Port Mapping

## 1. What Is Port Mapping?

Port mapping allows you to access a service running inside a Docker container through a port on the Docker host.

For example, a web server may listen on port `80` inside a container. Docker can publish it through port `8080` on your host.

```bash
docker run -d --name web -p 8080:80 nginx
```

Open `http://localhost:8080` in your browser.

The syntax is:

```text
HOST_PORT:CONTAINER_PORT
```

- **Host port:** The port exposed on your machine (`8080`).
- **Container port:** The port the application listens on inside the container (`80`).

The two ports do not need to have the same number.

## 2. How to Inspect Port Mapping

List running containers:

```bash
docker ps
```

Inspect the published ports of a specific container:

```bash
docker port web
```

Example output:

```text
80/tcp -> 0.0.0.0:8080
```

This indicates that host port `8080` forwards traffic to container port `80`.

## 3. Practical Example

Run Nginx:

```bash
docker run -d --name nginx-test -p 8080:80 nginx
```

Open `http://localhost:8080` to see the Nginx welcome page.

When finished, stop and remove the container:

```bash
docker stop nginx-test
docker rm nginx-test
```

## Key Takeaways

- Port mapping connects a host port to a container port.
- The syntax is `HOST_PORT:CONTAINER_PORT`.
- A running container does not automatically make its application accessible from the host.
- Use `docker ps` and `docker port` to inspect published ports.
