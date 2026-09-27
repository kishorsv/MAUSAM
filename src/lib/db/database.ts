import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { User, Profile, UserPreferences, SavedLocation, TravelPlan, PlannedEvent, AppNotification, NotificationPreferences } from './types';

interface DatabaseData {
  users: User[];
  profiles: Profile[];
  user_preferences: UserPreferences[];
  saved_locations: SavedLocation[];
  notifications: AppNotification[];
  travel_plans: TravelPlan[];
  events: PlannedEvent[];
  notification_preferences: NotificationPreferences[];
}

class DatabaseRepository {
  private pgPool: Pool | null = null;
  private localFilePath: string;
  private memoryData: DatabaseData | null = null;
  private initialized: boolean = false;

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
        this.memoryData = JSON.parse(raw);
        return this.memoryData!;
      } catch {
        // Fallback to initial seed
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
      ]
    };

    fs.writeFileSync(this.localFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    this.memoryData = initialData;
    return initialData;
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

    // Initialize Default Profile
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

    // Initialize Default Preferences (Fitness & Health enabled by default)
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

  // --- ADMIN & SYSTEM METRICS ---
  async getSystemStats() {
    const data = await this.loadLocalData();
    return {
      totalUsers: data.users.length,
      totalSavedLocations: data.saved_locations.length,
      totalTravelPlans: data.travel_plans.length,
      totalEvents: data.events.length,
      totalNotifications: data.notifications.length,
      unreadNotifications: data.notifications.filter(n => !n.is_read).length,
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
}

export const db = new DatabaseRepository();
