import { useState, useEffect } from 'react';
import api from '../utils/axios';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(url, options);
        setData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options]);

  return { data, loading, error, setData };
};

export const usePost = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const postData = async (data) => {
    try {
      setLoading(true);
      const result = await api.post(url, data, options);
      setResponse(result.data);
      setError(null);
      return result.data;
    } catch (err) {
      console.error('Error posting data:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error, response };
};

export const usePut = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const putData = async (data) => {
    try {
      setLoading(true);
      const result = await api.put(url, data, options);
      setResponse(result.data);
      setError(null);
      return result.data;
    } catch (err) {
      console.error('Error updating data:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { putData, loading, error, response };
};

export const useDelete = (url, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const deleteData = async () => {
    try {
      setLoading(true);
      const result = await api.delete(url, options);
      setResponse(result.data);
      setError(null);
      return result.data;
    } catch (err) {
      console.error('Error deleting data:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteData, loading, error, response };
}; 