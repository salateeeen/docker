run a container from template image or pull from dockerhub then run
`docker run nginx`

list all running containers and basic info about them
`docker ps`

list all running containers even if there stopped
`docker ps -a`

stop ruinning container
`docker stop containerName/Id`

to build an image from the docker-file instructions
`docker build -t tagName ./Dockerfile`

remove stopped or expired containers
`docker rm containerName/Id`


list all images in our device and thier sizes
`docker images`

remove images thats not have container instances (stop then delete all containers before)
`docker rmi imageName/Id`

running in attach mode (forground) attached to current terminal, view all logs and outputs
`docker run nodejs`


running in detach mode (background)
`docker -d run nodejs`

re-attach an detach container to terminal forground
`docker attach nodejs`

remove all stopped containers, all networks not used by any container
`docker system prune`

map port for the container itself on localhosy to port inside this container `-p` or `--publish`
`docker run -p 8000:3440 nodejs`

-i: Keep STDIN open for interactive input.
-t: Allocate a pseudo-TTY.
`docker run -it ubuntu bash`

map volume in external to volume in container to after remove the container still remain
`-v` or `--mount`
`docker run -v localmachine/data:docker/data nodejs`

`docker run --mount type=bind,source=/home/sultan/data,target=/app/data nodejs`

`docker run --mount type=volume,source=/home/sultan/data,target=/app/data nodejs`

--rm to remove the container after execute the command
`docker run --rm nodejs ls`

info for the container in json
`docker inspect containerName/Id`

execute just ls
`docker exec express-container ls ./`

execute bash and make a tty always running with stdin
`docker exec -it express-container bash`

to show all logs for a specific container runs in background
`docker logs containerName/Id`