const { Registry, Counter, Gauge, Histogram, Summary, register } = require('prom-client');

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

    const add = ({ name, data }) => {
        if (instances[name]) {
            const { type, instance } = instances[name];

            if (type === 'counter') {
                instance.labels({ method: 'GET', statusCode: '200' }).inc(data);
            } else if (type === 'gauge') {
                instance.labels({ method: 'GET', statusCode: '200' }).set(data);
            } else if (type === 'histogram') {
                instance.labels({ method: 'IssueCount', statusCode: '200' }).observe(data);
            } else if (type === 'summary') {
                instance.labels({ method: 'GET', statusCode: '200' }).observe(data);
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
    labelNames: ['method', 'statusCode'],
});
Prometheus.create({
    type: 'gauge',
    name: 'gauge',
    help: 'random gauge for test',
    labelNames: ['method', 'statusCode'],
});
Prometheus.create({
    type: 'histogram',
    name: 'histogram',
    help: 'random histogram for test',
    labelNames: ['method', 'statusCode'],
});
Prometheus.create({
    type: 'summary',
    name: 'summary',
    help: 'random summary for test',
    labelNames: ['method', 'statusCode'],
});

module.exports = {
    Prometheus,
};
