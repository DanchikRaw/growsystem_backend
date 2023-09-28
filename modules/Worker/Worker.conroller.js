const Device = require('./../Device/Device.model');
const Workers = require('./../Worker/Worker.model');
const SensorsHistory = require('./../Device/SensorHistory/SensorHistory.model');
const {format, differenceInMinutes} = require("date-fns");
const {utcToZonedTime} = require("date-fns-tz");
const {minutesToHoursFormat} = require("../../utils/convert");

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
                    worker_id: worker?._id,
                    visitType: visitType,
                    workDayLength: workDayLength
                };
            });

            return res.status(200).json(resultArray);
        } catch (error) {
            return res.status(500).json({ error: "Internal server error." });
        }
    },
    async getWorkerTotalHours(req, res) {
        const deviceId = req.query.deviceId;
        const workerId = req.query.workerId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        try {
            const device = await Device.findById(deviceId).populate("sensors").exec();

            if (!device) {
                return res.status(404).json({ error: "Device not found." });
            }

            const worker = await Workers.findById(workerId).exec();

            if (!worker) {
                return res.status(404).json({ error: "Worker not found or does not belong to the specified device." });
            }

            const formattedStartDate = format(new Date(startDate), "yyyy-MM-dd");
            const formattedEndDate = format(new Date(endDate), "yyyy-MM-dd");

            const sensorsHistory = await SensorsHistory.find({
                sensor: { $in: device.sensors },
                value: worker.id,
                date: {
                    $gte: new Date(formattedStartDate),
                    $lt: new Date(`${formattedEndDate}T23:59:59.999Z`)
                }
            }).sort({ date: 1 }).exec();

            let lastEntryTime = null;
            let totalWorkMinutes = 0;
            const uniqueWorkDays = new Set();
            let lastEntryDate = null;
            let isNextExpected = "start"; // начало или конец рабочего дня
            const dailyWorkMinutes = {}; // Карта для отслеживания рабочего времени по дням

            sensorsHistory.forEach((historyItem, index) => {
                const bangkokTime = utcToZonedTime(historyItem.date, 'Asia/Bangkok');
                const formattedDate = format(bangkokTime, "yyyy-MM-dd");

                uniqueWorkDays.add(formattedDate);
                // Если наступил новый день и последняя запись была "start", сбрасываем ее
                if (lastEntryDate && lastEntryDate !== formattedDate && isNextExpected === "end") {
                    lastEntryTime = null;
                    isNextExpected = "start";
                }

                if (isNextExpected === "start") {
                    lastEntryTime = bangkokTime;
                    lastEntryDate = formattedDate;
                    isNextExpected = "end";
                } else if (isNextExpected === "end" && lastEntryTime && lastEntryDate === formattedDate) {
                    const diffMinutes = differenceInMinutes(bangkokTime, lastEntryTime);
                    totalWorkMinutes += diffMinutes;

                    dailyWorkMinutes[formattedDate] = (dailyWorkMinutes[formattedDate] || 0) + diffMinutes;
                    isNextExpected = "start";
                }
            });

            const labels = Object.keys(dailyWorkMinutes);
            const data = labels.map(date => minutesToHoursFormat(dailyWorkMinutes[date]));

            const totalWorkHours = totalWorkMinutes / 60;
            const averageWorkHours = totalWorkMinutes / (60 * uniqueWorkDays.size);

            return res.status(200).json({
                name: worker.name,
                totalWorkHours: totalWorkHours.toFixed(2),
                averageWorkHours: isNaN(averageWorkHours) ? 0 : averageWorkHours.toFixed(2),
                dailyWorkHours: {
                    labels: labels,
                    datasets: [
                        {
                            data: data
                        }
                    ]
                } // Массив с количеством часов работы за каждый день
            });
        } catch (error) {
            return res.status(500).json({ error: "Internal server error." });
        }
    },
    async getWorkerHistoryByDevice(req, res) {
        const deviceId = req.query.deviceId;
        const selectedDate = req.query.date;
        const workerId = req.query.workerId; // Получаем ID работника из параметров запроса

        try {
            const device = await Device.findById(deviceId).populate("sensors").exec();
            if (!device) {
                return res.status(404).json({ error: "Device not found." });
            }

            const worker = await Workers.findById(workerId).exec();
            if (!worker) {
                return res.status(404).json({ error: "Worker not found or not associated with the given device." });
            }

            const formattedSelectedDate = format(new Date(selectedDate), "yyyy-MM-dd");

            const sensorsHistory = await SensorsHistory.find({
                sensor: { $in: device.sensors },
                date: {
                    $gte: new Date(formattedSelectedDate),
                    $lt: new Date(formattedSelectedDate + "T23:59:59.999Z")
                },
                value: worker.id  // Фильтруем историю сенсоров по id работника
            }).exec();

            const workerVisitCounts = {};
            const lastEntryTime = {};

            const resultArray = sensorsHistory.map(historyItem => {
                const bangkokTime = utcToZonedTime(historyItem.date, 'Asia/Bangkok');
                workerVisitCounts[worker.id] = (workerVisitCounts[worker.id] || 0) + 1;

                const isEvenVisit = workerVisitCounts[worker.id] % 2 === 0;
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
                    name: worker.name,
                    worker_id: worker._id,
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