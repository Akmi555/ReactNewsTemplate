import React, { useEffect, useState } from "react";
import Spinner from "../features/mainPage/components/spinner/Spinner";
import Carousel from "react-bootstrap/Carousel";
import Weather from "../features/mainPage/components/weather/Weather";
import Ad from "../features/mainPage/components/advertising/Adv";
import News from "../features/mainPage/components/news/News";
import NewsInfo from "../features/mainPage/components/news/NewsInfo";
import Title from "../features/mainPage/components/news/Title";
import { uid } from "uid";
import Blog from "../features/mainPage/components/blog/Blog";
import InfoComponent from "../features/mainPage/components/info/InfoComponent";
import { MainPageData, NewsMP, WeatherMP } from "../features/mainPage/mainPage";
import ErrorModal from "../features/mainPage/components/modal/ErrorModal";
import { useDispatch } from "react-redux";
import { topSlice } from "../layout/header/topElSlice";
import type { INewsTop } from "../layout/header/topElSlice";
const Home = () => {
  const [data, setData] = useState<MainPageData | null>(null);
  const [errorResponse, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherMP | null>(null);
  const [weatherLoading, setStatus] = useState<boolean>(true);
  const dispatch = useDispatch();
  useEffect(() => {
    fetch("/api/mainpage")
      .then((response) => {
        if (response.status > 299) {
          throw new Error("Server Error");
        }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        const newsDT: INewsTop[] = data.innerNews.slice(12, 15).map((item) => {
          return { news: item.title, url: item.id };
        });
        dispatch(topSlice.actions.setNews(newsDT));
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });

    fetch("/api/mainpage/weather")
      .then((response) => {
        if (response.status > 299) {
          throw new Error("Server Error");
        }
        setStatus(false);
        return response;
      })
      .then((res) => res.json())
      .then((data) => setWeather(data))
      .catch(() => setStatus(false));
  }, []);

  return (
    <>
      {data === null ? (
        <>
          <Spinner show={loading} color="red" />
          <ErrorModal
            show={errorResponse}
            onHide={() => {
              setError(false);
            }}
          />
        </>
      ) : (
        <>
          <div className=".bg-dark"></div>
          <div className="container mainBlock">
            <div className="row">
              <div className="col-6 picBlock smallWidth">
                <Carousel fade={true}>
                  {data.innerNews.slice(0, 4).map((newsItem: NewsMP) => (
                    <Carousel.Item key={uid()}>
                      <a href={"/news/" + newsItem.id}>
                        <div className="picBlock">
                          <img
                            width="100%"
                            src={newsItem.titleImageSquare}
                            alt={newsItem.title}
                          />
                        </div>

                        <Carousel.Caption>
                          <h4>{newsItem.title}</h4>
                          <NewsInfo info={newsItem} />
                        </Carousel.Caption>
                      </a>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
              <div className="col-6 smallWidth">
                <div className="row ">
                  {data.innerNews.slice(5, 7).map((newsItem) => (
                    <div key={uid()} className="col-6">
                      <a href={"/news/" + newsItem.id}>
                        <News city={false} info={newsItem} />
                      </a>
                    </div>
                  ))}
                </div>
                <div className="row">
                  <div className="col-12 weatherPadding">
                    {<Weather loading={weatherLoading} weather={weather} />}
                  </div>
                </div>
              </div>
            </div>
            <Ad text="Bestes Web-Erstellungsteam – klicken Sie hier, um einen Rabatt zu erhalten" />
            <div className="row">
              <div className="col-12">
                <Title title="Bundesland Nachrichten" />
                <div className="row">
                  {data.innerNews.slice(7, 11).map((item) => (
                    <div key={uid()} className="col-3">
                      <a href={"/news/" + item.id}>
                        <News city={true} info={item} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12 newsTopic2">
                <div className="row">
                  <div className="col-6 halfScreen">
                    <Title title="Neueste Anzeige" />
                    {data.rent.map((item) => (
                      <InfoComponent key={uid()} info={item} />
                    ))}
                  </div>
                  <div className="col-6 halfScreen">
                    <Title title="Ausland Nachrichten" />
                    <div className="row">
                      {data.world.map((item) => (
                        <div key={uid()} className="col-6 worldNews">
                          <a href={"/news/" + item.id}>
                            <News city={false} info={item} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Ad text="Hier kann Ihre Werbung platziert werden" />

            <div className="row">
              <div className="col-6 newSlider">
                <Title title="Sport Nachrichten" />
                <Carousel fade={true}>
                  {[0, 2, 4].map((item) => (
                    <Carousel.Item key={uid()}>
                      <div className="row">
                        {[0, 1].map((childItem) => (
                          <div key={uid()} className="col-6">
                            <a
                              href={"/news/" + data.sport[item + childItem].id}
                            >
                              <News
                                city={false}
                                info={data.sport[item + childItem]}
                              />
                            </a>
                          </div>
                        ))}
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
              <div className="col-6 newSlider">
                <Title title="Blogs" />
                {data.blogs.map((item) => (
                  <a href={"/blogs/"+item.id}>
                    <Blog key={uid()} info={item} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Home;
