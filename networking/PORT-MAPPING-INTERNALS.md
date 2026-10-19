# Docker Port Mapping: Behind the Scenes

## 1. The Big Picture

When you run:

```bash
docker run -d -p 8080:80 nginx
```

Docker arranges for traffic sent to host port `8080` to reach port `80` inside the container.

A simplified traffic path is:

```text
Browser
   |
   | http://localhost:8080
   v
Host network stack / published-port rules
   |
   v
Docker bridge network
   |
   v
Container network interface (eth0)
   |
   v
Nginx listening on port 80
```

The exact implementation depends on Docker's networking mode, version, operating system, and firewall configuration. Docker may use NAT rules, a userland proxy, or a combination of mechanisms.

## 2. Network Namespace

A Linux network namespace provides an isolated view of network resources, including:

- Network interfaces
- IP addresses
- Routing tables
- Network-related settings

A container normally has its own network namespace and network interface, such as `eth0`.

This isolation allows different containers to listen on the same container port without automatically conflicting with each other.

## 3. Virtual Ethernet Pair and Docker Bridge

On a typical Linux bridge network, Docker connects a container to the host using a virtual Ethernet pair.

```text
Container namespace             Host
+-------------------+           +----------------------+
| eth0              |<--------->| veth peer            |
| Container IP      |           | Docker bridge        |
+-------------------+           +----------------------+
```

One end of the virtual Ethernet pair appears inside the container. The other end connects to the host-side network.

The Docker bridge connects containers on that bridge network. The exact interface names and network layout can vary.

## 4. NAT and Forwarding

For a typical published port, Docker configures networking so traffic arriving at the host's published address and port can reach the container's IP address and target port.

```text
Host address:8080  ->  Container IP:80
```

Network Address Translation (NAT) may rewrite destination addresses and ports. Docker also configures forwarding and filtering rules as required by its networking mode and firewall backend.

Do not assume every Docker installation uses exactly the same iptables or nftables rules.

## 5. Why the Application Must Listen on the Right Address

The application inside the container must listen on an address reachable through the container's network interface.

For example, a Node.js application can listen on all container IPv4 interfaces:

```javascript
server.listen(3000, "0.0.0.0");
```

If it listens only on `127.0.0.1`, it accepts connections through the container's own loopback interface. Publishing the port does not fix an application that listens only on container loopback.

## 6. Inspect the Network

List Docker networks:

```bash
docker network ls
```

Inspect a network:

```bash
docker network inspect bridge
```

Inspect a container:

```bash
docker inspect CONTAINER
```

Inspect published ports:

```bash
docker port CONTAINER
docker ps
```

On Linux, inspect interfaces and routes:

```bash
ip address
ip route
```

## Key Takeaways

- Port publishing is a networking configuration.
- Containers commonly have isolated network namespaces.
- Docker bridge networking often uses virtual Ethernet interfaces and a Linux bridge.
- Published-port traffic may be handled by NAT rules, a userland proxy, or both.
- The application must listen on a suitable address and the correct container port.