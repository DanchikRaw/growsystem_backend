const Device = require('./../Device/Device.model');
const Workers = require('./../Worker/Worker.model');
const SensorsHistory = require('./../Device/SensorHistory/SensorHistory.model');
const {format} = require("date-fns");
const {utcToZonedTime} = require("date-fns-tz");

module.exports.WorkerController = {
    async getWorkersHistoryByDevice(req, res) {
        const deviceId = req.query.deviceId; // Получаем ID устройства из параметров запроса
        const selectedDate = req.query.date;

        try {
            // Ищем device по ID
            const device = await Device.findById(deviceId).populate("sensors").exec();

            if (!device) {
                console.log("Device not found.");
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

            // Собираем итоговый массив
            const resultArray = sensorsHistory.map(historyItem => {
                const worker = workers.find(worker => worker.id === historyItem.value);
                const bangkokTime = utcToZonedTime(historyItem.date, 'Asia/Bangkok');
                return {
                    datetime: format(bangkokTime, "yyyy-MM-dd HH:mm:ss"),
                    name: worker ? worker.name : "Unknown"
                };
            });

            return res.status(200).json(resultArray);
        } catch (error) {
            console.error("Error fetching workers history:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};