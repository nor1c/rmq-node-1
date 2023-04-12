## Monitor
- http://localhost:15672/

## List queues with rabbitmqadmin
```bash
docker exec <container-name> rabbitmqadmin -u root -p root get queue=<queue-name>
```