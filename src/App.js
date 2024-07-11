import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [cpus, setCpus] = useState(null);
    const [gpus, setGpus] = useState(null);
    const [ram, setRam] = useState(null);
    const [kraken, setKraken] = useState(null);

    const [cpuT, setCpuT] = useState(40);
    const [liquid, setLiquid] = useState(30);
    const [weather, setWeather] = useState("01d");
    const [outTemp, setOutTemp] = useState("-20");

    const [pm10v, setPm10v] = useState("000");
    const [pm25v, setPm25v] = useState("000");

    const [pm10g, setPm10g] = useState("000");
    const [pm25g, setPm25g] = useState("000");
    
    const [clock, setClock] = useState("00:00");

    useEffect(() => {
        window.nzxt = {
            v1: {
                onMonitoringDataUpdate: (data) => {
                    const { cpus, gpus, ram, kraken } = data;

                    setCpus(cpus);
                    setGpus(gpus);
                    setRam(ram);
                    setKraken(kraken);

                    setCpuT(Math.floor(cpus[0].temperature));
                    setLiquid(kraken.liquidTemperature);
                }
            }
        };
    }, []);

    const timeFormatZ = (ints) => {
        return ints < 10 ? "0" + ints : ints;
    };

    const weatherAxi = () => {
        const dustGrade = (value) => {
            switch (value) {
                case -1:
                    return "#aa80ff";
                case 1:
                    return "#66e0ff";
                case 2:
                    return "#66ff66";
                case 3:
                    return "#ff9933";
                case 4:
                    return "#ff3333";
                default:
                    return "#ffffff";
            }
        };

        axios.get("https://api.tsukimorifriends.xyz/api/weather/current/온천동?authkey=" + process.env.REACT_APP_PRODUCT_KEY)
            .then(r => {
                const result = r.data.body;
                setWeather(result.weather.current.weather[0].icon);
                setOutTemp(Math.floor(result.weather.current.temp));

                setPm10v(result.dust.pm10v);
                setPm25v(result.dust.pm25v);

                setPm10g(dustGrade(result.dust.pm10g));
                setPm25g(dustGrade(result.dust.pm25g));
            }).catch(e => {
                setWeather("Error Data");
            });
    };

    useEffect(() => {
        weatherAxi(); // Initial weather data fetch

        const weatherTimer = setInterval(() => {
            weatherAxi();
        }, 1000 * 60 * 10); // Fetch weather data every 10 minutes

        return () => {
            clearInterval(weatherTimer);
        };
    }, []); // Only run on component mount

    useEffect(() => {
        const Timer = setInterval(() => {
            let time = new Date();
            let hours = time.getHours();
            let minutes = time.getMinutes();

            hours = hours % 12;
            hours = hours ? hours : 12;

            setClock(timeFormatZ(hours) + ":" + timeFormatZ(minutes));
        }, 1000);

        return () => {
            clearInterval(Timer);
        };
    }, []); // Only run on component mount

    return (
        <div>
            <div className="elias" style={{ backgroundImage: `radial-gradient(#0000, #000F), url(${"https://lroseline.github.io/kraken-new-playground/weather/" + weather + ".png"})` }}>
                <div className="circle">
                    <div className="clock">{clock}</div>
                    <div className="cpu">
                        <div>
                            <div className="tabo">CPU</div>
                            <div className="tabo-value">{cpuT}</div>
                        </div>
                        <div>
                            <div className="tabo">AIO</div>
                            <div className="tabo-value">{liquid}</div>
                        </div>
                    </div>
                </div>
                <div className="bottom">
                    <div className="pm10">
                        <div>
                            <span style={{ boxShadow: '0 3px 0 ' + pm10g }}>PM10</span>
                        </div>
                        <div className="bottom-value-small">{pm10v}</div>
                    </div>
                    <div className="outside">
                        <div>OUTSIDE</div>
                        <div className="bottom-value">{outTemp}</div>
                    </div>
                    <div className="pm25">
                        <div>
                            <span style={{ boxShadow: '0 3px 0 ' + pm25g }}>PM25</span>
                        </div>
                        <div className="bottom-value-small">{pm25v}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;