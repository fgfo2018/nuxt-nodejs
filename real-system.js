const cpu = require('windows-cpu');
const path = require('path');
setInterval(() => {
    if (!cpu.isSupported()) {
        throw new Error('windows-cpu is not supported on this platform');
    }
    cpu.totalLoad().then(load => {
        console.log(load);
        // Single CPU example:
        // => [10]
        // Multi-CPU example:
        // => [10, 5]
    });
    cpu.totalMemoryUsage().then(mem => {
        console.log(mem);
        /* =>
            {
                usageInKb: 3236244,
                usageInMb: 3160.39453125,
                usageInGb: 3.086322784423828 
            }
        */
    });
}, 1000)