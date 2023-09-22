const Device = require('./../Device/Device.model');
const Workers = require('./../Worker/Worker.model');
const SensorsHistory = require('./../Device/SensorHistory/SensorHistory.model');
const {format, differenceInMinutes} = require("date-fns");
const {utcToZonedTime} = require("date-fns-tz");

module.exports.WorkerController = {
    async getWorkersHistoryByDevice(req, res) {
        const deviceId = req.query.deviceId; // Получаем ID устройства из параметров запроса
        const selectedDate = req.query.date;

        try {
            // Ищем device по ID
            const device = await Device.findById(deviceId).populate("sensors").exec();

            if (!device) {
                return res.status(404).json({ error: "Device not found." });
            }

            // Ищем сотрудников, связанных с данным device
            const workers = await Workers.find({ device: device._id }).exec();
            const formattedSelectedDate = format(new Date(selectedDate), "yyyy-MM-dd"); // Преобразуем дату в формат "YYYY-MM-DD"

            // Получаем историю сенсоров для найденных сенсоров устройства
            const sensorsHistory = await SensorsHistory.find({
                sensor: { $in: device.sensors },
                date: {
                    $gte: new Date(formattedSelectedDate), // Сравниваем по дню начиная с полуночи выбранной даты
                    $lt: new Date(formattedSelectedDate + "T23:59:59.999Z") // Сравниваем по дню до полуночи следующего дня
                }
            }).exec();

            const workerVisitCounts = {};
            const lastEntryTime = {};

            // Собираем итоговый массив
            const resultArray = sensorsHistory.map(historyItem => {
                const worker = workers.find(worker => worker.id === historyItem.value);
                const bangkokTime = utcToZonedTime(historyItem.date, 'Asia/Bangkok');

                if (worker) {
                    workerVisitCounts[worker.id] = (workerVisitCounts[worker.id] || 0) + 1;
                }

                const isEvenVisit = worker && workerVisitCounts[worker.id] % 2 === 0;
                const visitType = isEvenVisit ? 'exit' : 'entry';

                let workDayLength = null;

                if (!isEvenVisit) {
                    lastEntryTime[worker.id] = bangkokTime;
                } else if (lastEntryTime[worker.id]) {
                    const diffMinutes = differenceInMinutes(bangkokTime, lastEntryTime[worker.id]);
                    workDayLength = `${Math.floor(diffMinutes / 60)} hours and ${diffMinutes % 60} minutes`;
                }

                return {
                    datetime: format(bangkokTime, "yyyy-MM-dd HH:mm:ss"),
                    name: worker ? worker.name : "Unknown",
                    visitType: visitType,
                    workDayLength: workDayLength
                };
            });

            return res.status(200).json(resultArray);
        } catch (error) {
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};