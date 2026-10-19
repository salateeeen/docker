# Docker Port Mapping

## 1. What Is Port Mapping?

**Port Mapping** is a Docker networking feature that allows traffic arriving at a port on the host machine to reach a port inside a container.

Containers can run network services, such as web servers and APIs, that listen on ports inside the container.

However, a port exposed by a container is not necessarily accessible through the host's network interfaces automatically.

Port mapping establishes a connection between a host port and a container port.

### The Basic Idea

Imagine you have a Node.js application running inside a Docker container.

Your application listens on port `3000` inside the container, but you want to access it from your browser using:

```text
http://localhost:8080
```

You can map host port `8080` to container port `3000`.

```text
Browser
   |
   | http://localhost:8080
   v
Host Machine
   |
   | Host Port: 8080
   v
Docker Port Mapping
   |
   | Container Port: 3000
   v
Container
   |
   v
Node.js Application
Listening on port 3000
```

When you access `localhost:8080`, Docker forwards the incoming traffic to port `3000` inside the container.

The host and container ports do not have to be the same.

---

## 2. Host Port vs. Container Port

Understanding the difference between these two ports is essential.

### Host Port

The port on the host machine through which clients access the containerized application.

For example:

```text
localhost:8080
```

Here, `8080` is the host port.

### Container Port

The port on which the application listens inside the container's network environment.

For example:

```text
Application listens on port 3000
```

Here, `3000` is the container port.

### Example

Consider this mapping:

```text
8080:3000
```

It means:

```text
Host Port      = 8080
Container Port = 3000
```

The mapping does not change the port on which the application listens.

The application still listens on port `3000` inside the container.

Docker simply provides a path for traffic arriving at the mapped host port to reach that application.

---

## 3. How to Map Ports in Docker

Docker uses the `-p` or `--publish` option to configure port mapping.

### Basic Syntax

```bash
docker run -p HOST_PORT:CONTAINER_PORT IMAGE
```

For example:

```bash
docker run -p 8080:3000 my-node-app
```

This maps host port `8080` to container port `3000`.

If the application listens on port `3000` inside the container, you can access it through:

```text
http://localhost:8080
```

### Same Host and Container Ports

```bash
docker run -p 3000:3000 my-node-app
```

Both ports are `3000`.

You can access the application through:

```text
http://localhost:3000
```

### Different Host and Container Ports

```bash
docker run -p 8080:3000 my-node-app
```

You access the application through port `8080` on the host, while the application continues listening on port `3000` inside the container.

### Mapping Multiple Ports

An application or container may need multiple published ports.

```bash
docker run \
  -p 8080:3000 \
  -p 8443:443 \
  my-node-app
```

This configures two mappings:

| Host Port | Container Port |
|---|---|
| 8080 | 3000 |
| 8443 | 443 |

Each mapping is independent.

---

## 4. What Is the Difference Between EXPOSE and -p?

This is one of the most important Docker concepts to understand.

### EXPOSE in a Dockerfile

```dockerfile
FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

The `EXPOSE 3000` instruction documents that the application is intended to use port `3000` inside the container.

However, **EXPOSE does not publish the port to the host by itself**.

It does not automatically configure host-to-container port forwarding.

### -p When Running a Container

```bash
docker run -p 8080:3000 my-node-app
```

The `-p` option publishes host port `8080` and maps it to container port `3000`.

### Comparison

| Feature | EXPOSE | -p / --publish |
|---|---|---|
| Where is it used? | Dockerfile | `docker run` |
| Main purpose | Documents an intended container port | Publishes and maps a port |
| Automatically publishes to host? | No | Yes |
| Can specify a different host port? | No | Yes |

**Important:** An application can listen on a port without using `EXPOSE`. The application, Docker networking configuration, and port publication are separate concerns.

---

## 5. How Does Port Mapping Work Behind the Scenes?

Consider:

```bash
docker run -p 8080:3000 my-node-app
```

Assume the application listens on port `3000` inside the container.

A simplified description of the traffic flow is:

1. Docker creates or configures the container's network environment.
2. Docker configures the requested port publication.
3. A client sends a request to the host's port `8080`.
4. Docker's networking implementation forwards the traffic to port `3000` inside the container.
5. The application receives the request and sends a response through the corresponding network path.

### Networking Components

The exact implementation depends on the Docker networking mode, platform, and configuration.

On a typical Linux Docker bridge network, several components may be involved.

#### Network Namespace

The container usually has its own network namespace.

This provides an isolated view of network interfaces, addresses, routes, and related networking resources.

The application listens on a port within that network environment.

#### Virtual Ethernet Pair

Docker commonly connects a container's network interface to the host through a virtual Ethernet pair (`veth`).

One end is inside the container's network namespace, and the other connects to the host's networking infrastructure, commonly through a bridge.

#### Docker Bridge

A bridge connects container network interfaces at Layer 2 and allows communication between connected containers, subject to network and firewall configuration.

The default bridge is commonly named `docker0`, although user-defined networks and other configurations can use different bridges.

#### NAT and Firewall Rules

On many Linux Docker installations, port publication is implemented using network address translation (NAT) and firewall rules.

These rules direct traffic addressed to a published host port toward the container's IP address and destination port.

Docker may use iptables or nftables-related networking implementations, depending on its configuration.

Some setups use a userland proxy or other forwarding mechanisms.

### Simplified Traffic Flow

```text
Client / Browser
       |
       | Destination: HOST_IP:8080
       v
Host Networking
       |
       v
Port Publishing / Forwarding
       |
       | Destination becomes CONTAINER_IP:3000
       v
Docker Bridge / Container Network
       |
       v
Container Network Interface
       |
       v
Node.js Application
Listening on port 3000
```

This diagram represents a common Linux bridge-networking setup. The exact packet-processing path can differ by configuration.

---

## 6. Why Must the Application Listen on 0.0.0.0?

This is a common source of confusion when running web applications inside Docker.

Consider a Node.js server:

```javascript
server.listen(3000, "127.0.0.1");
```

Here, the server listens only on the container's loopback interface.

The address `127.0.0.1` refers to the loopback interface of the network namespace in which the process runs.

Inside a container, this is the container's own loopback interface, not the host's loopback interface.

Therefore, traffic forwarded to the container's network IP generally cannot reach a server listening only on `127.0.0.1`.

Instead, a typical containerized web application should listen on:

```javascript
server.listen(3000, "0.0.0.0");
```

The address `0.0.0.0` means the server listens on all available IPv4 interfaces in its network environment.

This allows the server to accept traffic arriving through the container's network interface, subject to other networking and security settings.

### Important Distinction

- `127.0.0.1`: The loopback interface of the current network namespace.
- `0.0.0.0`: All local IPv4 interfaces when used as a listening address.
- `localhost:8080`: A client destination on the host, commonly resolving to a loopback address.

Port mapping cannot fix an application that is not listening on an appropriate interface and port.

---

## 7. Practical Example: Run an Nginx Container

You can test port mapping without creating your own application.

Run:

```bash
docker run -d \
  --name nginx-test \
  -p 8080:80 \
  nginx
```

This command:

- Starts an Nginx container in the background.
- Names the container `nginx-test`.
- Maps host port `8080` to container port `80`.

Nginx normally listens on port `80` inside the container.

Open your browser and visit:

```text
http://localhost:8080
```

You should see the Nginx welcome page if the container started successfully and the port is accessible.

### Check the Published Port

Run:

```bash
docker ps
```

Look at the `PORTS` column. You should see a mapping similar to:

```text
0.0.0.0:8080->80/tcp
```

This indicates that host IPv4 address `0.0.0.0` on port `8080` is published toward container port `80`.

Depending on the configuration, additional IPv6 or other mapping entries may appear.

You can also inspect the mapping with:

```bash
docker port nginx-test
```

### Stop and Remove the Container

```bash
docker rm -f nginx-test
```

This stops and removes the test container.

---

## 8. Bind a Published Port to a Specific Host Address

By default, publishing a port without specifying a host IP commonly makes it accessible through the host's available interfaces, subject to the networking configuration and firewall rules.

You can explicitly choose the host address.

### Publish on All IPv4 Interfaces

```bash
docker run -p 0.0.0.0:8080:80 nginx
```

This requests publication on all host IPv4 interfaces.

### Publish Only on Host Loopback

```bash
docker run -p 127.0.0.1:8080:80 nginx
```

This restricts the published port to the host's IPv4 loopback address.

You can then access it locally through:

```text
http://127.0.0.1:8080
```

Other machines generally cannot access this service through the host's external network address.

**Security note:** Publishing a port on all interfaces may expose the service to other machines, depending on the host network and firewall configuration. Bind to loopback when local-only access is sufficient.

---

## 9. What Happens If Two Containers Use the Same Container Port?

Two containers can listen on the same container port because they normally have separate network namespaces.

For example:

```bash
docker run -d --name app1 -p 8080:3000 my-node-app
docker run -d --name app2 -p 8081:3000 my-node-app
```

Both applications listen on port `3000` inside their respective containers.

The host uses different ports to access them:

| Container | Container Port | Host Port |
|---|---|---|
| app1 | 3000 | 8080 |
| app2 | 3000 | 8081 |

The access URLs are:

```text
http://localhost:8080
http://localhost:8081
```

This works because the host ports are different.

### What If Both Containers Use the Same Host Port?

For example:

```bash
docker run -d --name app1 -p 8080:3000 my-node-app
docker run -d --name app2 -p 8080:3000 my-node-app
```

On a typical setup, the second container cannot bind the same host IP and port combination because the published port is already in use.

Docker will normally report a port allocation or binding error.

The exact conflict depends on the host address, protocol, and networking configuration.

---

## 10. Port Mapping vs. Container-to-Container Communication

Port mapping is primarily useful when traffic needs to reach a container through a published host port.

Containers on the same suitable Docker network can often communicate directly using their container ports.

For example, imagine two services:

- A Node.js backend listening on port `3000`.
- A MySQL database listening on port `3306`.

If both containers are connected to the same user-defined bridge network, the backend can connect to MySQL using the database container's network name and port:

```text
mysql-db:3306
```

The backend does not necessarily need to connect through a published host port.

A possible configuration is:

```bash
docker network create app-network
```

Start MySQL on that network:

```bash
docker run -d \
  --name mysql-db \
  --network app-network \
  -e MYSQL_ROOT_PASSWORD=example \
  mysql:8.4
```

Then another container on the same network can use `mysql-db:3306` as the database endpoint, provided the database is ready and credentials are correct.

This example is for learning; use proper credentials and secret management for real applications.

### Key Difference

- **Port mapping:** Provides access through a host-published port.
- **Container networking:** Allows connected containers to communicate through their network addresses or service names.

Publishing a database port is not required just because another container needs to connect to it.

---

## 11. Common Port Mapping Problems

### Problem 1: The Application Is Not Listening

You mapped:

```bash
docker run -p 8080:3000 my-node-app
```

But the application listens on port `4000`.

The mapping points to the wrong container port.

**Solution:** Map the host port to the actual application port:

```bash
docker run -p 8080:4000 my-node-app
```

### Problem 2: The Application Listens on 127.0.0.1

The application listens only on the container's loopback interface.

**Solution:** Configure the server to listen on `0.0.0.0` when appropriate.

### Problem 3: The Host Port Is Already in Use

Another process or container is already using the requested host IP and port combination.

**Solution:** Choose another host port:

```bash
docker run -p 8081:3000 my-node-app
```

### Problem 4: The Port Was Never Published

You ran:

```bash
docker run my-node-app
```

Even if the application listens on port `3000`, that command does not publish the port to the host.

**Solution:**

```bash
docker run -p 8080:3000 my-node-app
```

### Problem 5: Firewall or Network Restrictions

The port is published, but remote clients cannot reach the service.

Possible causes include host firewall rules, cloud security groups, network routing, or application configuration.

**Solution:** Inspect the Docker port mapping and the relevant network and firewall settings.

---

## 12. Key Takeaways

- Port mapping connects a published host port to a port inside a container.
- The syntax is `-p HOST_PORT:CONTAINER_PORT`.
- Host and container ports can be different.
- `EXPOSE` documents an intended container port but does not publish it by itself.
- Docker port publication commonly uses NAT and firewall rules on Linux, although implementation details vary.
- A containerized server usually needs to listen on `0.0.0.0` to accept traffic arriving through its container network interface.
- Multiple containers can listen on the same container port while using different host ports.
- Containers on the same suitable Docker network can communicate without publishing every service port to the host.
- Published ports can expose services beyond the local machine, so host address binding and firewall configuration matter.

**In one sentence:** Docker port mapping provides a way to route traffic from a host port to an application port inside a container.