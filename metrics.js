const { Registry, Counter, Gauge, Histogram, Summary,register,collectDefaultMetrics } = require('prom-client');
const prefix = 'discordBot_';
collectDefaultMetrics({ prefix });

const prometheus = () => {
    const registry = new Registry();
    const instances = {};

    const create = ({ type, name, help,labelNames }) => {
        let instance;

        if (type === 'counter') {
            instance = new Counter({ name, help,labelNames });
        } else if (type === 'gauge') {
            instance = new Gauge({ name, help,labelNames });
        } else if (type === 'histogram') {
            instance = new Histogram({ name, help ,labelNames});
        } else if (type === 'summary') {
            instance = new Summary({ name, help,labelNames });
        }

        if (instance) {
            registry.registerMetric(instance);
            instances[name] = { type, instance };
        }
    };

    const add = ({ name, data,labels }) => {
        if (instances[name]) {
            const { type, instance } = instances[name];

            if (type === 'counter') {
                instance.labels(labels).inc(data);
            } else if (type === 'gauge') {
                instance.labels(labels).set(data);
            } else if (type === 'histogram') {
                instance.labels(labels).observe(data);
            } else if (type === 'summary') {
                instance.labels(labels).observe(data);
            }
        }
    };

    const get = async () => {
        return {
            metrics: await registry.metrics(),
            contentType: register.contentType,
        };
    };

    return { create, add, get };
};

const Prometheus = prometheus();
Prometheus.create({
    type: 'counter',
    name: 'counter',
    help: 'random counter for test',
    labelNames: ['Project', 'Type'],
});
Prometheus.create({
    type: 'gauge',
    name: 'gauge',
    help: 'random gauge for test',
    labelNames: ['Project', 'Type'],
});
Prometheus.create({
    type: 'histogram',
    name: 'histogram',
    help: 'random histogram for test',
    labelNames: ['Project', 'Type'],
});
Prometheus.create({
    type: 'summary',
    name: 'summary',
    help: 'random summary for test',
    labelNames: ['Project', 'Type'],
});

module.exports = {
    Prometheus,
};
