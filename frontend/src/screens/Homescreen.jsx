import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import moment from 'moment';
import Rooms from '../components/Rooms';
import Loader from '../components/Loader';
import Error from '../components/Error';
import { roomsApi } from '../api/client';

const { RangePicker } = DatePicker;

const ITEMS_PER_PAGE = 8;

const Homescreen = React.memo(function Homescreen() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromdate, setfromdate] = useState(null);
  const [todate, settodate] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const cacheRef = useRef(null);

  useEffect(() => {
    const fetchRooms = async () => {
      // Use cached data if available
      if (cacheRef.current) {
        setRooms(cacheRef.current);
        setFilteredRooms(cacheRef.current);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await roomsApi.list();
        cacheRef.current = data;
        setRooms(data);
        setFilteredRooms(data);
      } catch (error) {
        setError(error.message || "Failed to fetch rooms");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filterByDate = useCallback((dates) => {
    if (dates && dates.length === 2) {
      const fd = moment(dates[0].toDate()).format("DD-MM-YYYY");
      const td = moment(dates[1].toDate()).format("DD-MM-YYYY");
      setfromdate(fd);
      settodate(td);

      // Just pass dates to child components - no filtering needed at parent level
      const source = cacheRef.current || rooms;
      if (source) {
        setFilteredRooms(source);
      }
      setVisibleCount(ITEMS_PER_PAGE);
    } else {
      setfromdate(null);
      settodate(null);
      const source = cacheRef.current || rooms;
      if (source) {
        setFilteredRooms(source);
      }
      setVisibleCount(ITEMS_PER_PAGE);
    }
  }, [rooms]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredRooms.length));
  }, [filteredRooms.length]);

  const displayRooms = filteredRooms.slice(0, visibleCount);

  return (
    <ConfigProvider
      theme={{
        components: {
          DatePicker: {
            controlHeight: 42,
          },
        },
      }}
    >
      <div className="page-screen">
        <section className="page-hero py-4">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="h2 fw-bold mb-1">Find Your <span className="accent">Perfect Stay</span></h1>
                <p className="lead mb-0 small">Browse premium rooms and book your next adventure</p>
              </div>
              <div>
                <RangePicker format="DD-MM-YYYY" onChange={filterByDate} />
              </div>
            </div>
          </div>
        </section>
        <section className="page-content pt-4">
        <div className="container">
        <div className="row justify-content-center">
          {loading ? (
            <Loader />
          ) : error ? (
            <Error message={error} />
          ) : displayRooms.length > 0 ? (
            displayRooms.map((room) => (
              <div className="col-md-9 mt-3" key={room.id}>
                <Rooms room={room} fromdate={fromdate} todate={todate} />
              </div>
            ))
          ) : (
            <Error message={"No rooms found"} />
          )}
        </div>

        {!loading && !error && filteredRooms.length > visibleCount && (
          <div className="row mt-4 mb-5">
            <div className="col text-center">
              <button className="btn btn-dark btn-lg px-5" onClick={loadMore}>
                Load More ({filteredRooms.length - visibleCount} remaining)
              </button>
            </div>
          </div>
        )}
        </div>
        </section>
      </div>
    </ConfigProvider>
  );
});

export default Homescreen;
