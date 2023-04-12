## Create RabbitMQ docker container
```bash
docker container create --name=rabbitmq -p 0.0.0.0:15672:15672 -p 0.0.0.0:5672:5672 -e RABBITMQ_DEFAULT_USERNAME=root -e RABBITMQ_DEFAULT_PASS=root rabbitmq:3-management
```

## Monitor
- http://localhost:15672/

## List queues with rabbitmqadmin
```bash
docker exec <container-name> rabbitmqadmin -u root -p root get queue=<queue-name>
```

## Result
![image](https://user-images.githubusercontent.com/7555972/231352963-367658da-637f-408c-b577-2fa3a6e92043.png)
