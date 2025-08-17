import axios from 'axios';
import Types from "../types";
import Utils from '../utils';

export class GeoService {
  /** Computes the optimal route between two locations */
  static async getOptimalRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  try {
      const API_KEY = process.env.GEO_API_KEY; // Assume Google Maps or another provider
      const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: API_KEY
        }
      });
      if (!response.data || response.data.status !== 'OK') throw new Utils.AppError(400, 'Failed to fetch route.');
      return response.data.routes[0];
    } catch (error) {
      throw new Utils.AppError(500, 'Error fetching optimal route.');
    }
  }
}
