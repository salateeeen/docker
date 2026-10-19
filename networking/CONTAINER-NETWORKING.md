# Docker Container-to-Container Networking

## 1. Port Publishing Is Not Always Required

Port publishing is mainly used to make a container service reachable through a port on the Docker host.

Containers on the same Docker network can generally communicate directly using their container ports. A database port does not need to be published on the host just so another container on the same network can access it.

## 2. Example: Node.js and MySQL

Create a user-defined bridge network:

```bash
docker network create app-network
```

Start MySQL on that network:

```bash
docker run -d \
  --name mysql-db \
  --network app-network \
  -e MYSQL_ROOT_PASSWORD=change-me \
  -e MYSQL_DATABASE=appdb \
  mysql:8
```

For production, use a strong secret and an appropriate secrets-management approach rather than putting passwords directly in shell history.

Run your application on the same network:

```bash
docker run -d \
  --name node-app \
  --network app-network \
  -p 3000:3000 \
  my-node-app
```

Configure the application to connect to MySQL using:

```text
DB_HOST=mysql-db
DB_PORT=3306
```

On a user-defined bridge network, Docker provides DNS-based name resolution for container names and network aliases.

The application connects to `mysql-db:3306`, not `localhost:3306`.

Inside `node-app`, `localhost` refers to the Node.js container itself.

## 3. Why Not Publish MySQL's Port?

For communication between these containers, the connection can be:

```text
Node.js container  --->  mysql-db:3306
```

Publishing MySQL with `-p 3306:3306` is unnecessary unless a process outside that Docker network needs to connect through the host.

If you need local development tools on the host to connect to MySQL, you could publish the port on loopback:

```bash
-p 127.0.0.1:3306:3306
```

Avoid exposing a database publicly without a deliberate security plan.

## 4. Default Bridge vs. User-Defined Bridge

Docker has a default bridge network. For most multi-container application setups, a user-defined bridge network is preferable because it provides automatic DNS resolution between containers by name.

Useful commands:

```bash
docker network create app-network
docker network ls
docker network inspect app-network
```

Connect an existing container:

```bash
docker network connect app-network CONTAINER
```

Disconnect it:

```bash
docker network disconnect app-network CONTAINER
```

## Key Takeaways

- Use `-p` when a service must be reachable through the Docker host.
- Containers on the same user-defined network can usually communicate using container names and container ports.
- Inside a container, `localhost` refers to that container.
- Keep database ports unpublished unless host-side access is actually needed.