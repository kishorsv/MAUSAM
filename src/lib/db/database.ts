import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { 
  User, Profile, UserPreferences, SavedLocation, TravelPlan, 
  PlannedEvent, AppNotification, NotificationPreferences, 
  SensorDevice, SensorReading, RouteTrip, GroupWeatherItem, WeatherSource,
  AIConversation, AIMessage, AIMemory, AIUsage, AIFeedback, 
  WeatherContextRecord, ActivityPreferences
} from './types';

interface DatabaseData {
  users: User[];
  profiles: Profile[];
  user_preferences: UserPreferences[];
  saved_locations: SavedLocation[];
  notifications: AppNotification[];
  travel_plans: TravelPlan[];
  events: PlannedEvent[];
  notification_preferences: NotificationPreferences[];
  sensor_devices: SensorDevice[];
  sensor_readings: SensorReading[];
  route_trips: RouteTrip[];
  group_weather: GroupWeatherItem[];
  weather_sources: WeatherSource[];
  ai_conversations: AIConversation[];
  ai_messages: AIMessage[];
  ai_memory: AIMemory[];
  ai_usage: AIUsage[];
  ai_feedback: AIFeedback[];
  weather_context: WeatherContextRecord[];
  activity_preferences: ActivityPreferences[];
}

class DatabaseRepository {
  private pgPool: Pool | null = null;
  private localFilePath: string;
  private memoryData: DatabaseData | null = null;

  constructor() {
    this.localFilePath = path.resolve(process.cwd(), 'data', 'mausam_storage.json');
    if (process.env.DATABASE_URL) {
      this.pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });
    }
  }

  private ensureDir() {
    const dir = path.dirname(this.localFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private async loadLocalData(): Promise<DatabaseData> {
    if (this.memoryData) return this.memoryData;
    this.ensureDir();

    if (fs.existsSync(this.localFilePath)) {
      try {
        const raw = fs.readFileSync(this.localFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure new arrays exist if loaded from older JSON
        parsed.sensor_devices = parsed.sensor_devices || [];
        parsed.sensor_readings = parsed.sensor_readings || [];
        parsed.route_trips = parsed.route_trips || [];
        parsed.group_weather = parsed.group_weather || [];
        parsed.weather_sources = parsed.weather_sources || [];
        parsed.ai_conversations = parsed.ai_conversations || [];
        parsed.ai_messages = parsed.ai_messages || [];
        parsed.ai_memory = parsed.ai_memory || [];
        parsed.ai_usage = parsed.ai_usage || [];
        parsed.ai_feedback = parsed.ai_feedback || [];
        parsed.weather_context = parsed.weather_context || [];
        parsed.activity_preferences = parsed.activity_preferences || [];
        
        if (parsed.weather_sources.length === 0) {
          parsed.weather_sources = this.getDefaultWeatherSources();
        }
        if (parsed.sensor_devices.length === 0) {
          parsed.sensor_devices = [
            {
              id: 'dev-esp32-01',
              user_id: 'usr-demo-01',
              name: 'Terrace ESP32 Agro Station',
              device_model: 'ESP32 LoRaWAN Gateway v2',
              mac_address: 'A4:CF:12:8B:90:3A',
              is_connected: false, // EXPLICITLY NOT CONNECTED UNLESS TELEMETRY INGESTED
              created_at: new Date().toISOString()
            }
          ];
        }
        if (parsed.route_trips.length === 0) {
          parsed.route_trips = [
            {
              id: 'route-01',
              user_id: 'usr-demo-01',
              title: 'Weekend Western Ghats Drive',
              start_location: 'Bengaluru',
              end_location: 'Coorg',
              waypoints: [
                { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
                { name: 'Mysuru', latitude: 12.2958, longitude: 76.6394 },
                { name: 'Madikeri (Coorg)', latitude: 12.4244, longitude: 75.7382 }
              ],
              travel_mode: 'car',
              created_at: new Date().toISOString()
            }
          ];
        }
        if (parsed.group_weather.length === 0) {
          parsed.group_weather = [
            {
              id: 'group-01',
              user_id: 'usr-demo-01',
              title: 'Karnataka Heritage & Hill Tour',
              group_type: 'road_trip',
              locations: [
                { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, status: 'Good' },
                { name: 'Mysuru', latitude: 12.2958, longitude: 76.6394, status: 'Good' },
                { name: 'Coorg', latitude: 12.4244, longitude: 75.7382, status: 'Moderate' }
              ],
              created_at: new Date().toISOString()
            }
          ];
        }

        this.memoryData = parsed;
        return this.memoryData!;
      } catch {
        // Fallback to fresh seed
      }
    }

    const defaultAdminHash = await bcrypt.hash('Admin@12345', 10);
    const defaultUserHash = await bcrypt.hash('User@12345', 10);

    const initialData: DatabaseData = {
      users: [
        {
          id: 'usr-admin-01',
          email: 'admin@mausam.app',
          password_hash: defaultAdminHash,
          full_name: 'System Administrator',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'usr-demo-01',
          email: 'user@mausam.app',
          password_hash: defaultUserHash,
          full_name: 'Priya Sharma',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
      profiles: [
        {
          id: 'prf-admin-01',
          user_id: 'usr-admin-01',
          default_lat: 12.9716,
          default_lon: 77.5946,
          default_city: 'Bengaluru',
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'prf-demo-01',
          user_id: 'usr-demo-01',
          default_lat: 12.9716,
          default_lon: 77.5946,
          default_city: 'Bengaluru',
          bio: 'Outdoor enthusiast & morning runner',
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
      user_preferences: [
        {
          id: 'pref-admin-01',
          user_id: 'usr-admin-01',
          health_enabled: true,
          fitness_enabled: true,
          travel_enabled: true,
          family_enabled: true,
          agriculture_enabled: true,
          commuter_enabled: true,
          event_enabled: true,
          beach_enabled: true,
          language: 'en',
          temperature_unit: 'celsius',
          wind_unit: 'kmh',
          notification_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'pref-demo-01',
          user_id: 'usr-demo-01',
          health_enabled: true,
          fitness_enabled: true,
          travel_enabled: true,
          family_enabled: false,
          agriculture_enabled: false,
          commuter_enabled: true,
          event_enabled: false,
          beach_enabled: false,
          language: 'en',
          temperature_unit: 'celsius',
          wind_unit: 'kmh',
          notification_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
      saved_locations: [
        {
          id: 'loc-01',
          user_id: 'usr-demo-01',
          name: 'Cubbon Park (Running Track)',
          latitude: 12.9763,
          longitude: 77.5929,
          location_type: 'gym',
          is_pinned: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 'loc-02',
          user_id: 'usr-demo-01',
          name: 'Manyata Tech Park (Office)',
          latitude: 13.0475,
          longitude: 77.6219,
          location_type: 'office',
          is_pinned: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'loc-03',
          user_id: 'usr-demo-01',
          name: 'Home (Indiranagar)',
          latitude: 12.9784,
          longitude: 77.6408,
          location_type: 'home',
          is_pinned: true,
          created_at: new Date().toISOString(),
        }
      ],
      notifications: [
        {
          id: 'notif-01',
          user_id: 'usr-demo-01',
          title: 'Optimal Running Window Ahead',
          message: 'Temperature is 21°C with low humidity and optimal air quality between 6:00 AM - 7:30 AM.',
          category: 'fitness',
          severity: 'minor',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'notif-02',
          user_id: 'usr-demo-01',
          title: 'Air Quality Advisory: Moderate PM2.5',
          message: 'AQI currently at 88 in Bengaluru. Sensitive individuals should consider lighter workouts.',
          category: 'aqi',
          severity: 'moderate',
          is_read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        }
      ],
      travel_plans: [
        {
          id: 'trv-01',
          user_id: 'usr-demo-01',
          destination_name: 'Coorg (Madikeri)',
          latitude: 12.4244,
          longitude: 75.7382,
          departure_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
          return_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
          notes: 'Weekend coffee estate trail and trekking trip',
          packing_advice: ['Light fleece jacket', 'Waterproof trail shoes', 'Windbreaker', 'Insect repellent'],
          created_at: new Date().toISOString()
        }
      ],
      events: [
        {
          id: 'evt-01',
          user_id: 'usr-demo-01',
          title: 'Morning 10k Run & Breakfast',
          event_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          start_time: '06:30',
          end_time: '08:30',
          location_name: 'Cubbon Park, Bengaluru',
          latitude: 12.9763,
          longitude: 77.5929,
          is_outdoor: true,
          comfort_score: 92,
          weather_summary: 'Pleasant morning conditions, 20°C, zero rain probability',
          created_at: new Date().toISOString()
        }
      ],
      notification_preferences: [
        {
          id: 'notifpref-01',
          user_id: 'usr-demo-01',
          rain_alert: true,
          severe_storm: true,
          heat_wave: true,
          aqi_warning: true,
          fitness_window: true,
          travel_update: true,
          commute_update: true,
          created_at: new Date().toISOString()
        }
      ],
      sensor_devices: [
        {
          id: 'dev-esp32-01',
          user_id: 'usr-demo-01',
          name: 'Terrace ESP32 Agro Station',
          device_model: 'ESP32 LoRaWAN Gateway v2',
          mac_address: 'A4:CF:12:8B:90:3A',
          is_connected: false, // Strict truthfulness: disconnected until physical telemetry posted
          created_at: new Date().toISOString()
        }
      ],
      sensor_readings: [],
      route_trips: [
        {
          id: 'route-01',
          user_id: 'usr-demo-01',
          title: 'Weekend Western Ghats Drive',
          start_location: 'Bengaluru',
          end_location: 'Coorg',
          waypoints: [
            { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
            { name: 'Mysuru', latitude: 12.2958, longitude: 76.6394 },
            { name: 'Madikeri (Coorg)', latitude: 12.4244, longitude: 75.7382 }
          ],
          travel_mode: 'car',
          created_at: new Date().toISOString()
        }
      ],
      group_weather: [
        {
          id: 'group-01',
          user_id: 'usr-demo-01',
          title: 'Karnataka Heritage & Hill Tour',
          group_type: 'road_trip',
          locations: [
            { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, status: 'Good' },
            { name: 'Mysuru', latitude: 12.2958, longitude: 76.6394, status: 'Good' },
            { name: 'Coorg', latitude: 12.4244, longitude: 75.7382, status: 'Moderate' }
          ],
          created_at: new Date().toISOString()
        }
      ],
      weather_sources: this.getDefaultWeatherSources(),
      ai_conversations: [],
      ai_messages: [],
      ai_memory: [],
      ai_usage: [],
      ai_feedback: [],
      weather_context: [],
      activity_preferences: []
    };

    fs.writeFileSync(this.localFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    this.memoryData = initialData;
    return initialData;
  }

  private getDefaultWeatherSources(): WeatherSource[] {
    return [
      { id: 'open-meteo', name: 'Open-Meteo IMD/ECMWF Core', source_type: 'weather', status: 'operational', latency_ms: 128, last_checked: new Date().toISOString(), error_count: 0 },
      { id: 'open-meteo-aqi', name: 'CPCB / Open-Meteo Air Quality', source_type: 'aqi', status: 'operational', latency_ms: 145, last_checked: new Date().toISOString(), error_count: 0 },
      { id: 'rainviewer-radar', name: 'RainViewer Global Doppler Radar', source_type: 'radar', status: 'operational', latency_ms: 210, last_checked: new Date().toISOString(), error_count: 0 },
      { id: 'eumetsat-sat', name: 'EUMETSAT / NOAA Satellite Geostationary', source_type: 'satellite', status: 'operational', latency_ms: 180, last_checked: new Date().toISOString(), error_count: 0 },
      { id: 'google-gemini', name: 'Google Gemini 1.5 Grounded Assistant', source_type: 'ai', status: 'operational', latency_ms: 320, last_checked: new Date().toISOString(), error_count: 0 }
    ];
  }

  private saveLocalData() {
    if (!this.memoryData) return;
    this.ensureDir();
    fs.writeFileSync(this.localFilePath, JSON.stringify(this.memoryData, null, 2), 'utf-8');
  }

  // --- USER METHODS ---
  async getUserByEmail(email: string): Promise<User | null> {
    const data = await this.loadLocalData();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const data = await this.loadLocalData();
    return data.users.find(u => u.id === id) || null;
  }

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const data = await this.loadLocalData();
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.users.push(newUser);

    const profile: Profile = {
      id: `prf-${Date.now()}`,
      user_id: newUser.id,
      default_lat: 12.9716,
      default_lon: 77.5946,
      default_city: 'Bengaluru',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.profiles.push(profile);

    const prefs: UserPreferences = {
      id: `pref-${Date.now()}`,
      user_id: newUser.id,
      health_enabled: true,
      fitness_enabled: true,
      travel_enabled: false,
      family_enabled: false,
      agriculture_enabled: false,
      commuter_enabled: false,
      event_enabled: false,
      beach_enabled: false,
      language: 'en',
      temperature_unit: 'celsius',
      wind_unit: 'kmh',
      notification_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.user_preferences.push(prefs);

    this.saveLocalData();
    return newUser;
  }

  // --- PROFILE METHODS ---
  async getProfile(userId: string): Promise<Profile | null> {
    const data = await this.loadLocalData();
    return data.profiles.find(p => p.user_id === userId) || null;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const data = await this.loadLocalData();
    const idx = data.profiles.findIndex(p => p.user_id === userId);
    if (idx === -1) {
      const newProfile: Profile = {
        id: `prf-${Date.now()}`,
        user_id: userId,
        default_lat: updates.default_lat ?? 12.9716,
        default_lon: updates.default_lon ?? 77.5946,
        default_city: updates.default_city ?? 'Bengaluru',
        onboarding_completed: updates.onboarding_completed ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates
      };
      data.profiles.push(newProfile);
      this.saveLocalData();
      return newProfile;
    }
    data.profiles[idx] = {
      ...data.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveLocalData();
    return data.profiles[idx];
  }

  // --- PREFERENCES METHODS ---
  async getPreferences(userId: string): Promise<UserPreferences> {
    const data = await this.loadLocalData();
    const found = data.user_preferences.find(p => p.user_id === userId);
    if (found) return found;

    const defaultPrefs: UserPreferences = {
      id: `pref-${Date.now()}`,
      user_id: userId,
      health_enabled: true,
      fitness_enabled: true,
      travel_enabled: false,
      family_enabled: false,
      agriculture_enabled: false,
      commuter_enabled: false,
      event_enabled: false,
      beach_enabled: false,
      language: 'en',
      temperature_unit: 'celsius',
      wind_unit: 'kmh',
      notification_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.user_preferences.push(defaultPrefs);
    this.saveLocalData();
    return defaultPrefs;
  }

  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const data = await this.loadLocalData();
    const idx = data.user_preferences.findIndex(p => p.user_id === userId);
    if (idx === -1) {
      const newPrefs: UserPreferences = {
        id: `pref-${Date.now()}`,
        user_id: userId,
        health_enabled: true,
        fitness_enabled: true,
        travel_enabled: false,
        family_enabled: false,
        agriculture_enabled: false,
        commuter_enabled: false,
        event_enabled: false,
        beach_enabled: false,
        language: 'en',
        temperature_unit: 'celsius',
        wind_unit: 'kmh',
        notification_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates,
      };
      data.user_preferences.push(newPrefs);
      this.saveLocalData();
      return newPrefs;
    }
    data.user_preferences[idx] = {
      ...data.user_preferences[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveLocalData();
    return data.user_preferences[idx];
  }

  // --- SAVED LOCATIONS ---
  async getSavedLocations(userId: string): Promise<SavedLocation[]> {
    const data = await this.loadLocalData();
    return data.saved_locations.filter(loc => loc.user_id === userId);
  }

  async addSavedLocation(userId: string, location: Omit<SavedLocation, 'id' | 'user_id' | 'created_at'>): Promise<SavedLocation> {
    const data = await this.loadLocalData();
    const newLoc: SavedLocation = {
      ...location,
      id: `loc-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    data.saved_locations.push(newLoc);
    this.saveLocalData();
    return newLoc;
  }

  async deleteSavedLocation(userId: string, locationId: string): Promise<boolean> {
    const data = await this.loadLocalData();
    const initialLen = data.saved_locations.length;
    data.saved_locations = data.saved_locations.filter(l => !(l.id === locationId && l.user_id === userId));
    const changed = data.saved_locations.length !== initialLen;
    if (changed) this.saveLocalData();
    return changed;
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const data = await this.loadLocalData();
    return data.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async addNotification(userId: string, notif: Omit<AppNotification, 'id' | 'user_id' | 'created_at' | 'is_read'>): Promise<AppNotification> {
    const data = await this.loadLocalData();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    data.notifications.push(newNotif);
    this.saveLocalData();
    return newNotif;
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    const data = await this.loadLocalData();
    const notif = data.notifications.find(n => n.id === notificationId && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      this.saveLocalData();
    }
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    const data = await this.loadLocalData();
    data.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    this.saveLocalData();
  }

  // --- TRAVEL PLANS ---
  async getTravelPlans(userId: string): Promise<TravelPlan[]> {
    const data = await this.loadLocalData();
    return data.travel_plans.filter(t => t.user_id === userId);
  }

  async addTravelPlan(userId: string, plan: Omit<TravelPlan, 'id' | 'user_id' | 'created_at'>): Promise<TravelPlan> {
    const data = await this.loadLocalData();
    const newPlan: TravelPlan = {
      ...plan,
      id: `trv-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    data.travel_plans.push(newPlan);
    this.saveLocalData();
    return newPlan;
  }

  async deleteTravelPlan(userId: string, id: string): Promise<boolean> {
    const data = await this.loadLocalData();
    const len = data.travel_plans.length;
    data.travel_plans = data.travel_plans.filter(t => !(t.id === id && t.user_id === userId));
    if (data.travel_plans.length !== len) {
      this.saveLocalData();
      return true;
    }
    return false;
  }

  // --- EVENTS ---
  async getEvents(userId: string): Promise<PlannedEvent[]> {
    const data = await this.loadLocalData();
    return data.events.filter(e => e.user_id === userId);
  }

  async addEvent(userId: string, event: Omit<PlannedEvent, 'id' | 'user_id' | 'created_at'>): Promise<PlannedEvent> {
    const data = await this.loadLocalData();
    const newEvent: PlannedEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    data.events.push(newEvent);
    this.saveLocalData();
    return newEvent;
  }

  async deleteEvent(userId: string, id: string): Promise<boolean> {
    const data = await this.loadLocalData();
    const len = data.events.length;
    data.events = data.events.filter(e => !(e.id === id && e.user_id === userId));
    if (data.events.length !== len) {
      this.saveLocalData();
      return true;
    }
    return false;
  }

  // --- IOT SENSOR DEVICES & TELEMETRY ---
  async getSensorDevices(userId: string): Promise<SensorDevice[]> {
    const data = await this.loadLocalData();
    return data.sensor_devices.filter(d => d.user_id === userId);
  }

  async addSensorDevice(userId: string, device: Omit<SensorDevice, 'id' | 'user_id' | 'created_at' | 'is_connected'>): Promise<SensorDevice> {
    const data = await this.loadLocalData();
    const newDevice: SensorDevice = {
      ...device,
      id: `dev-${Date.now()}`,
      user_id: userId,
      is_connected: false,
      created_at: new Date().toISOString()
    };
    data.sensor_devices.push(newDevice);
    this.saveLocalData();
    return newDevice;
  }

  async recordSensorReading(deviceId: string, reading: Omit<SensorReading, 'id' | 'device_id' | 'recorded_at'>): Promise<SensorReading> {
    const data = await this.loadLocalData();
    const newReading: SensorReading = {
      ...reading,
      id: `read-${Date.now()}`,
      device_id: deviceId,
      recorded_at: new Date().toISOString()
    };
    data.sensor_readings.push(newReading);

    const dev = data.sensor_devices.find(d => d.id === deviceId);
    if (dev) {
      dev.is_connected = true;
      dev.last_reading_at = newReading.recorded_at;
    }

    this.saveLocalData();
    return newReading;
  }

  async getLatestSensorReading(deviceId: string): Promise<SensorReading | null> {
    const data = await this.loadLocalData();
    const readings = data.sensor_readings.filter(r => r.device_id === deviceId);
    if (readings.length === 0) return null;
    return readings[readings.length - 1];
  }

  // --- ROUTE WEATHER TRIPS ---
  async getRouteTrips(userId: string): Promise<RouteTrip[]> {
    const data = await this.loadLocalData();
    return data.route_trips.filter(r => r.user_id === userId);
  }

  async addRouteTrip(userId: string, trip: Omit<RouteTrip, 'id' | 'user_id' | 'created_at'>): Promise<RouteTrip> {
    const data = await this.loadLocalData();
    const newTrip: RouteTrip = {
      ...trip,
      id: `route-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    data.route_trips.push(newTrip);
    this.saveLocalData();
    return newTrip;
  }

  async deleteRouteTrip(userId: string, id: string): Promise<boolean> {
    const data = await this.loadLocalData();
    const len = data.route_trips.length;
    data.route_trips = data.route_trips.filter(r => !(r.id === id && r.user_id === userId));
    if (data.route_trips.length !== len) {
      this.saveLocalData();
      return true;
    }
    return false;
  }

  // --- GROUP WEATHER COMPARISONS ---
  async getGroupWeather(userId: string): Promise<GroupWeatherItem[]> {
    const data = await this.loadLocalData();
    return data.group_weather.filter(g => g.user_id === userId);
  }

  async addGroupWeather(userId: string, group: Omit<GroupWeatherItem, 'id' | 'user_id' | 'created_at'>): Promise<GroupWeatherItem> {
    const data = await this.loadLocalData();
    const newGroup: GroupWeatherItem = {
      ...group,
      id: `group-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    data.group_weather.push(newGroup);
    this.saveLocalData();
    return newGroup;
  }

  async deleteGroupWeather(userId: string, id: string): Promise<boolean> {
    const data = await this.loadLocalData();
    const len = data.group_weather.length;
    data.group_weather = data.group_weather.filter(g => !(g.id === id && g.user_id === userId));
    if (data.group_weather.length !== len) {
      this.saveLocalData();
      return true;
    }
    return false;
  }

  // --- WEATHER SOURCES & SYSTEM TELEMETRY ---
  async getWeatherSources(): Promise<WeatherSource[]> {
    const data = await this.loadLocalData();
    return data.weather_sources;
  }

  async updateWeatherSource(id: string, updates: Partial<WeatherSource>): Promise<void> {
    const data = await this.loadLocalData();
    const idx = data.weather_sources.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.weather_sources[idx] = {
        ...data.weather_sources[idx],
        ...updates,
        last_checked: new Date().toISOString()
      };
      this.saveLocalData();
    }
  }

  // --- ADMIN SYSTEM METRICS ---
  async getSystemStats() {
    const data = await this.loadLocalData();
    return {
      totalUsers: data.users.length,
      totalSavedLocations: data.saved_locations.length,
      totalTravelPlans: data.travel_plans.length,
      totalEvents: data.events.length,
      totalNotifications: data.notifications.length,
      unreadNotifications: data.notifications.filter(n => !n.is_read).length,
      connectedSensors: data.sensor_devices.filter(d => d.is_connected).length,
      totalSensorDevices: data.sensor_devices.length,
      activeRoutes: data.route_trips.length,
      groupComparisons: data.group_weather.length,
      activeProfiles: {
        health: data.user_preferences.filter(p => p.health_enabled).length,
        fitness: data.user_preferences.filter(p => p.fitness_enabled).length,
        travel: data.user_preferences.filter(p => p.travel_enabled).length,
        family: data.user_preferences.filter(p => p.family_enabled).length,
        agriculture: data.user_preferences.filter(p => p.agriculture_enabled).length,
        commuter: data.user_preferences.filter(p => p.commuter_enabled).length,
        event: data.user_preferences.filter(p => p.event_enabled).length,
        beach: data.user_preferences.filter(p => p.beach_enabled).length,
      }
    };
  }

  // --- AI CONVERSATIONS & CHAT ---
  async getAIConversations(userId: string): Promise<AIConversation[]> {
    const data = await this.loadLocalData();
    return data.ai_conversations
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  async getAIConversation(conversationId: string): Promise<AIConversation | null> {
    const data = await this.loadLocalData();
    return data.ai_conversations.find(c => c.id === conversationId) || null;
  }

  async createAIConversation(userId: string, title?: string): Promise<AIConversation> {
    const data = await this.loadLocalData();
    const newConv: AIConversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      title: title || 'New Weather Consultation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.ai_conversations.unshift(newConv);
    this.saveLocalData();
    return newConv;
  }

  async updateAIConversation(conversationId: string, title: string): Promise<AIConversation | null> {
    const data = await this.loadLocalData();
    const conv = data.ai_conversations.find(c => c.id === conversationId);
    if (!conv) return null;
    conv.title = title;
    conv.updated_at = new Date().toISOString();
    this.saveLocalData();
    return conv;
  }

  async deleteAIConversation(conversationId: string): Promise<boolean> {
    const data = await this.loadLocalData();
    data.ai_conversations = data.ai_conversations.filter(c => c.id !== conversationId);
    data.ai_messages = data.ai_messages.filter(m => m.conversation_id !== conversationId);
    this.saveLocalData();
    return true;
  }

  async clearAIConversations(userId: string): Promise<boolean> {
    const data = await this.loadLocalData();
    const userConvIds = new Set(data.ai_conversations.filter(c => c.user_id === userId).map(c => c.id));
    data.ai_conversations = data.ai_conversations.filter(c => c.user_id !== userId);
    data.ai_messages = data.ai_messages.filter(m => !userConvIds.has(m.conversation_id));
    this.saveLocalData();
    return true;
  }

  async getAIMessages(conversationId: string, limit = 50): Promise<AIMessage[]> {
    const data = await this.loadLocalData();
    return data.ai_messages
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-limit);
  }

  async createAIMessage(
    conversationId: string, 
    role: 'user' | 'assistant' | 'system', 
    content: string, 
    metadata?: any
  ): Promise<AIMessage> {
    const data = await this.loadLocalData();
    const newMsg: AIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversation_id: conversationId,
      role,
      content,
      metadata,
      created_at: new Date().toISOString()
    };
    data.ai_messages.push(newMsg);

    // Update conversation updated_at and auto-title
    const conv = data.ai_conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.updated_at = new Date().toISOString();
      if (role === 'user' && conv.title === 'New Weather Consultation') {
        conv.title = content.length > 40 ? content.slice(0, 37) + '...' : content;
      }
    }

    this.saveLocalData();
    return newMsg;
  }

  // --- AI MEMORY ---
  async getAIMemory(userId: string): Promise<AIMemory> {
    const data = await this.loadLocalData();
    let mem = data.ai_memory.find(m => m.user_id === userId);
    if (!mem) {
      mem = {
        id: `mem-${Date.now()}`,
        user_id: userId,
        preferred_activities: ['morning running', 'cycling'],
        saved_locations: ['Home', 'Office'],
        weather_interests: ['AQI', 'Precipitation', 'UV Index'],
        updated_at: new Date().toISOString()
      };
      data.ai_memory.push(mem);
      this.saveLocalData();
    }
    return mem;
  }

  async updateAIMemory(userId: string, updates: Partial<AIMemory>): Promise<AIMemory> {
    const data = await this.loadLocalData();
    let mem = data.ai_memory.find(m => m.user_id === userId);
    if (!mem) {
      mem = {
        id: `mem-${Date.now()}`,
        user_id: userId,
        preferred_activities: [],
        saved_locations: [],
        weather_interests: [],
        updated_at: new Date().toISOString()
      };
      data.ai_memory.push(mem);
    }
    Object.assign(mem, updates, { updated_at: new Date().toISOString() });
    this.saveLocalData();
    return mem;
  }

  // --- AI USAGE & TELEMETRY ---
  async recordAIUsage(usage: Omit<AIUsage, 'id' | 'created_at'>): Promise<AIUsage> {
    const data = await this.loadLocalData();
    const entry: AIUsage = {
      id: `use-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...usage,
      created_at: new Date().toISOString()
    };
    data.ai_usage.push(entry);
    this.saveLocalData();
    return entry;
  }

  async getAIUsageStats(userId?: string) {
    const data = await this.loadLocalData();
    const entries = userId ? data.ai_usage.filter(u => u.user_id === userId) : data.ai_usage;
    const totalRequests = entries.length;
    const totalTokens = entries.reduce((sum, u) => sum + (u.token_usage?.total_tokens || 0), 0);
    const avgLatencyMs = totalRequests > 0 ? Math.round(entries.reduce((sum, u) => sum + u.response_time_ms, 0) / totalRequests) : 0;
    const successCount = entries.filter(u => u.success).length;
    const successRate = totalRequests > 0 ? Math.round((successCount / totalRequests) * 100) : 100;
    return { totalRequests, totalTokens, avgLatencyMs, successRate };
  }

  // --- AI FEEDBACK ---
  async recordAIFeedback(feedback: Omit<AIFeedback, 'id' | 'created_at'>): Promise<AIFeedback> {
    const data = await this.loadLocalData();
    const entry: AIFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...feedback,
      created_at: new Date().toISOString()
    };
    data.ai_feedback.push(entry);
    this.saveLocalData();
    return entry;
  }

  // --- WEATHER CONTEXT SNAPSHOTS ---
  async saveWeatherContext(context: Omit<WeatherContextRecord, 'id' | 'created_at'>): Promise<WeatherContextRecord> {
    const data = await this.loadLocalData();
    const entry: WeatherContextRecord = {
      id: `ctx-${Date.now()}`,
      ...context,
      created_at: new Date().toISOString()
    };
    data.weather_context.push(entry);
    if (data.weather_context.length > 100) {
      data.weather_context = data.weather_context.slice(-100);
    }
    this.saveLocalData();
    return entry;
  }
}

export const db = new DatabaseRepository();
