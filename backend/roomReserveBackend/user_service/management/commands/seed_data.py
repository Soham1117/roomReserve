import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction, IntegrityError

# Import models from all relevant apps
from auth_service.models import Role
from user_service.models import UserProfile, UserPreferences
from hotel_service.models import Hotel, RoomType, Amenity, RoomAvailability # Added RoomAvailability
from booking_service.models import Booking, BookingStatus, BookingGuest
from payment_service.models import Payment, PaymentStatus
from notification_service.models import NotificationLog, NotificationType
from review_service.models import Review, ReviewResponse

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with comprehensive sample data for all services.'

    @transaction.atomic  # Ensure all operations succeed or fail together
    def handle(self, *args, **options):
        self.stdout.write("Deleting existing data...")
        # Order matters due to foreign key constraints
        ReviewResponse.objects.all().delete()
        NotificationLog.objects.all().delete()
        NotificationType.objects.all().delete()
        Payment.objects.all().delete()
        PaymentStatus.objects.all().delete()
        Review.objects.all().delete()
        BookingGuest.objects.all().delete()
        Booking.objects.all().delete()
        BookingStatus.objects.all().delete()
        RoomAvailability.objects.all().delete() # Added RoomAvailability deletion
        RoomType.objects.all().delete()
        Amenity.objects.all().delete()
        Hotel.objects.all().delete()
        UserPreferences.objects.all().delete()
        UserProfile.objects.all().delete()
        Role.objects.all().delete()
        User.objects.filter(is_superuser=False).delete() # Keep superuser
        self.stdout.write(self.style.SUCCESS("Existing data deleted."))

        self.stdout.write("Creating sample data...")

        # --- Create Roles ---
        self.stdout.write("Creating Roles...")
        role_names = ['user', 'admin', 'hotel_manager']
        roles = {name: Role.objects.create(name=name) for name in role_names}
        self.stdout.write(self.style.SUCCESS(f"{len(roles)} Roles created."))

        # --- Create Users and Profiles ---
        self.stdout.write("Creating Users and Profiles...")
        users = {} # Store users by username
        user_data = [
            {'username': 'johndoe', 'email': 'john.doe@example.com', 'first_name': 'John', 'last_name': 'Doe', 'phone': '123-456-7890', 'role': 'user'},
            {'username': 'janesmith', 'email': 'jane.smith@example.com', 'first_name': 'Jane', 'last_name': 'Smith', 'phone': '987-654-3210', 'role': 'user'},
            {'username': 'guestuser', 'email': 'guest@example.com', 'first_name': 'Guest', 'last_name': 'User', 'phone': '555-555-5555', 'role': 'user'},
            {'username': 'hoteladmin', 'email': 'admin@hotel.com', 'first_name': 'Hotel', 'last_name': 'Admin', 'phone': '111-222-3333', 'role': 'hotel_manager'},
        ]
        for data in user_data:
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password='password123', # Use a common password for sample data
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            users[data['username']] = user
            # Note: Role assignment would typically happen via ManyToMany field if defined.

        # Update the automatically created profiles (due to signals)
        self.stdout.write("Updating User Profiles...")
        profiles_updated_count = 0
        created_users_qs = User.objects.filter(username__in=[ud['username'] for ud in user_data])
        for user in created_users_qs:
            data = next((ud for ud in user_data if ud['username'] == user.username), None)
            if data:
                try:
                    profile = user.userprofile # Access via related name
                    profile.phone_number = data['phone']
                    profile.address_line1 = '123 Sample St'
                    profile.city = 'Sample City'
                    profile.country = 'USA'
                    profile.first_name = data['first_name'] # Sync profile name fields
                    profile.last_name = data['last_name']
                    profile.save()
                    profiles_updated_count += 1
                except UserProfile.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Profile for {user.username} not found, skipping update."))
        self.stdout.write(self.style.SUCCESS(f"{profiles_updated_count} User Profiles updated."))

        # --- Create User Preferences ---
        self.stdout.write("Creating User Preferences...")
        prefs_created_count = 0
        for user in created_users_qs:
            try:
                prefs = user.userpreferences # Access via related name
                prefs.newsletter_subscribed = random.choice([True, False])
                prefs.save()
                prefs_created_count += 1
            except UserPreferences.DoesNotExist:
                 self.stdout.write(self.style.WARNING(f"Preferences for {user.username} not found, skipping update."))
        self.stdout.write(self.style.SUCCESS(f"{prefs_created_count} User Preferences created/updated."))


        # --- Create Amenities ---
        self.stdout.write("Creating Amenities...")
        amenity_names = ['Free WiFi', 'Swimming Pool', 'Gym', 'Parking', 'Restaurant', 'Air Conditioning', 'Pet Friendly', 'Spa', 'Room Service']
        amenities = [Amenity.objects.create(name=name) for name in amenity_names]
        self.stdout.write(self.style.SUCCESS(f"{len(amenities)} Amenities created."))

        # --- Create Hotels ---
        self.stdout.write("Creating Hotels...")
        # New hotels_data list (approx. 80 entries)
        hotels_data = [
            # North America
            {'name': 'The St. Regis New York', 'address_line1': 'Two E 55th St', 'city': 'New York', 'state': 'NY', 'country': 'USA', 'description': 'Iconic luxury on Fifth Avenue.', 'rating': 4.8, 'latitude': 40.7614, 'longitude': -73.9746},
            {'name': 'Fairmont Banff Springs', 'address_line1': '405 Spray Ave', 'city': 'Banff', 'state': 'AB', 'country': 'Canada', 'description': 'Castle in the Rockies.', 'rating': 4.7, 'latitude': 51.1678, 'longitude': -115.5633},
            {'name': 'Hotel Nacional de Cuba', 'address_line1': 'Calle 21 y O', 'city': 'Havana', 'state': '', 'country': 'Cuba', 'description': 'Historic landmark hotel.', 'rating': 4.2, 'latitude': 23.1448, 'longitude': -82.3817},
            {'name': 'Four Seasons Mexico City', 'address_line1': 'Paseo de la Reforma 500', 'city': 'Mexico City', 'state': '', 'country': 'Mexico', 'description': 'Urban oasis on Reforma.', 'rating': 4.8, 'latitude': 19.4219, 'longitude': -99.1749},
            {'name': 'The Beverly Hills Hotel', 'address_line1': '9641 Sunset Blvd', 'city': 'Beverly Hills', 'state': 'CA', 'country': 'USA', 'description': 'The legendary Pink Palace.', 'rating': 4.7, 'latitude': 34.0822, 'longitude': -118.4140},
            {'name': 'Waldorf Astoria Cancun', 'address_line1': 'Carr. Fed. 307 Cancún-Tulum Km 248-886', 'city': 'Cancun', 'state': 'QR', 'country': 'Mexico', 'description': 'Secluded beachfront luxury.', 'rating': 4.9, 'latitude': 20.9871, 'longitude': -86.7800},
            {'name': 'The Drake Hotel', 'address_line1': '140 E Walton Pl', 'city': 'Chicago', 'state': 'IL', 'country': 'USA', 'description': 'Historic elegance on Magnificent Mile.', 'rating': 4.5, 'latitude': 41.8997, 'longitude': -87.6230},
            {'name': 'Hotel Vancouver', 'address_line1': '900 W Georgia St', 'city': 'Vancouver', 'state': 'BC', 'country': 'Canada', 'description': 'Grand dame hotel downtown.', 'rating': 4.4, 'latitude': 49.2840, 'longitude': -123.1210},
            {'name': 'Bellagio Las Vegas', 'address_line1': '3600 S Las Vegas Blvd', 'city': 'Las Vegas', 'state': 'NV', 'country': 'USA', 'description': 'Luxury resort with iconic fountains.', 'rating': 4.7, 'latitude': 36.1126, 'longitude': -115.1746},
            {'name': 'The Hay-Adams', 'address_line1': '800 16th St NW', 'city': 'Washington', 'state': 'DC', 'country': 'USA', 'description': 'Historic hotel overlooking the White House.', 'rating': 4.7, 'latitude': 38.9011, 'longitude': -77.0369},

            # South America
            {'name': 'Belmond Copacabana Palace', 'address_line1': 'Av. Atlântica 1702', 'city': 'Rio de Janeiro', 'state': 'RJ', 'country': 'Brazil', 'description': 'Glamorous beachfront icon.', 'rating': 4.8, 'latitude': -22.9676, 'longitude': -43.1768},
            {'name': 'Hotel Fasano São Paulo', 'address_line1': 'R. Vitório Fasano 88', 'city': 'São Paulo', 'state': 'SP', 'country': 'Brazil', 'description': 'Stylish design hotel.', 'rating': 4.7, 'latitude': -23.5680, 'longitude': -46.6660},
            {'name': 'Alvear Palace Hotel', 'address_line1': 'Av. Alvear 1891', 'city': 'Buenos Aires', 'state': '', 'country': 'Argentina', 'description': 'Grand luxury in Recoleta.', 'rating': 4.8, 'latitude': -34.5880, 'longitude': -58.3910},
            {'name': 'Sofitel Legend Santa Clara Cartagena', 'address_line1': 'Calle Del Torno 39-29', 'city': 'Cartagena', 'state': 'BOL', 'country': 'Colombia', 'description': 'Historic convent turned hotel.', 'rating': 4.7, 'latitude': 10.4260, 'longitude': -75.5500},
            {'name': 'Explora Patagonia', 'address_line1': 'Torres del Paine National Park', 'city': 'Torres del Paine', 'state': '', 'country': 'Chile', 'description': 'Luxury lodge in Patagonia.', 'rating': 4.9, 'latitude': -51.0500, 'longitude': -73.0000},
            {'name': 'Inkaterra Machu Picchu Pueblo Hotel', 'address_line1': 'Km 110', 'city': 'Aguas Calientes', 'state': '', 'country': 'Peru', 'description': 'Cloud forest sanctuary near Machu Picchu.', 'rating': 4.8, 'latitude': -13.1550, 'longitude': -72.5250},
            {'name': 'W Bogota', 'address_line1': 'Av. Cra 9 #115-30', 'city': 'Bogota', 'state': '', 'country': 'Colombia', 'description': 'Modern luxury in Usaquén.', 'rating': 4.6, 'latitude': 4.6980, 'longitude': -74.0300},
            {'name': 'Tierra Atacama Hotel & Spa', 'address_line1': 'Ayquina S/N', 'city': 'San Pedro de Atacama', 'state': '', 'country': 'Chile', 'description': 'Adventure spa in the desert.', 'rating': 4.9, 'latitude': -22.9100, 'longitude': -68.2000},
            {'name': 'Palacio del Inka, a Luxury Collection Hotel', 'address_line1': 'Plazoleta Santo Domingo 259', 'city': 'Cusco', 'state': '', 'country': 'Peru', 'description': 'Historic palace near Plaza de Armas.', 'rating': 4.7, 'latitude': -13.5190, 'longitude': -71.9760},
            {'name': 'Hotel Unique São Paulo', 'address_line1': 'Av. Brigadeiro Luís Antônio 4700', 'city': 'São Paulo', 'state': 'SP', 'country': 'Brazil', 'description': 'Iconic watermelon-shaped hotel.', 'rating': 4.6, 'latitude': -23.5800, 'longitude': -46.6680},

            # Europe
            {'name': 'Hotel de Crillon, A Rosewood Hotel', 'address_line1': '10 Place de la Concorde', 'city': 'Paris', 'state': '', 'country': 'France', 'description': 'Historic palace hotel.', 'rating': 4.9, 'latitude': 48.8660, 'longitude': 2.3210},
            {'name': 'Claridge\'s', 'address_line1': 'Brook Street', 'city': 'London', 'state': '', 'country': 'UK', 'description': 'Art Deco elegance in Mayfair.', 'rating': 4.8, 'latitude': 51.5120, 'longitude': -0.1480},
            {'name': 'Hotel Hassler Roma', 'address_line1': 'Piazza della Trinità dei Monti 6', 'city': 'Rome', 'state': '', 'country': 'Italy', 'description': 'Luxury atop the Spanish Steps.', 'rating': 4.7, 'latitude': 41.9060, 'longitude': 12.4830},
            {'name': 'Badrutt\'s Palace Hotel', 'address_line1': 'Via Serlas 27', 'city': 'St. Moritz', 'state': '', 'country': 'Switzerland', 'description': 'Legendary Alpine resort.', 'rating': 4.9, 'latitude': 46.4970, 'longitude': 9.8400},
            {'name': 'Hotel Sacher Wien', 'address_line1': 'Philharmoniker Str. 4', 'city': 'Vienna', 'state': '', 'country': 'Austria', 'description': 'Home of the original Sacher-Torte.', 'rating': 4.7, 'latitude': 48.2040, 'longitude': 16.3690},
            {'name': 'Adare Manor', 'address_line1': 'Adare', 'city': 'Limerick', 'state': '', 'country': 'Ireland', 'description': 'Neo-Gothic luxury manor.', 'rating': 5.0, 'latitude': 52.5640, 'longitude': -8.7900},
            {'name': 'Grand Hotel Tremezzo', 'address_line1': 'Via Provinciale Regina 8', 'city': 'Tremezzina', 'state': 'CO', 'country': 'Italy', 'description': 'Art Nouveau palace on Lake Como.', 'rating': 4.9, 'latitude': 45.9860, 'longitude': 9.2280},
            {'name': 'Hotel Maria Cristina, a Luxury Collection Hotel', 'address_line1': 'Paseo República Argentina 4', 'city': 'San Sebastián', 'state': '', 'country': 'Spain', 'description': 'Belle Époque elegance.', 'rating': 4.7, 'latitude': 43.3190, 'longitude': -1.9800},
            {'name': 'Canaves Oia Suites', 'address_line1': 'Main Street', 'city': 'Oia', 'state': '', 'country': 'Greece', 'description': 'Luxury suites carved into the cliffside.', 'rating': 4.9, 'latitude': 36.4620, 'longitude': 25.3750},
            {'name': 'The Dolder Grand', 'address_line1': 'Kurhausstrasse 65', 'city': 'Zurich', 'state': '', 'country': 'Switzerland', 'description': 'City resort with stunning views.', 'rating': 4.8, 'latitude': 47.3700, 'longitude': 8.5700},

            # Africa
            {'name': 'La Mamounia', 'address_line1': 'Avenue Bab Jdid', 'city': 'Marrakech', 'state': '', 'country': 'Morocco', 'description': 'Legendary palace hotel with gardens.', 'rating': 4.8, 'latitude': 31.6220, 'longitude': -7.9980},
            {'name': 'The Silo Hotel', 'address_line1': 'Silo Square, V&A Waterfront', 'city': 'Cape Town', 'state': 'WC', 'country': 'South Africa', 'description': 'Luxury hotel in a former grain silo.', 'rating': 4.9, 'latitude': -33.9050, 'longitude': 18.4200},
            {'name': 'Giraffe Manor', 'address_line1': 'Gogo Falls Road', 'city': 'Nairobi', 'state': '', 'country': 'Kenya', 'description': 'Boutique hotel with resident giraffes.', 'rating': 4.9, 'latitude': -1.3700, 'longitude': 36.7450},
            {'name': 'Four Seasons Resort Seychelles', 'address_line1': 'Petite Anse', 'city': 'Mahe Island', 'state': '', 'country': 'Seychelles', 'description': 'Luxury villas on a hillside.', 'rating': 4.8, 'latitude': -4.7300, 'longitude': 55.4700},
            {'name': 'Royal Mansour Marrakech', 'address_line1': 'Rue Abou Abbas El Sebti', 'city': 'Marrakech', 'state': '', 'country': 'Morocco', 'description': 'Opulent riads within medina walls.', 'rating': 5.0, 'latitude': 31.6270, 'longitude': -7.9990},
            {'name': 'Singita Sabi Sand', 'address_line1': 'Sabi Sand Game Reserve', 'city': 'Kruger National Park Area', 'state': 'MP', 'country': 'South Africa', 'description': 'Luxury safari lodges.', 'rating': 5.0, 'latitude': -24.7800, 'longitude': 31.4500},
            {'name': 'The Oberoi, Sahl Hasheesh', 'address_line1': 'Sahl Hasheesh', 'city': 'Hurghada', 'state': '', 'country': 'Egypt', 'description': 'All-suite luxury resort on the Red Sea.', 'rating': 4.8, 'latitude': 27.0400, 'longitude': 33.8800},
            {'name': 'One&Only Gorilla\'s Nest', 'address_line1': 'Kinigi', 'city': 'Volcanoes National Park', 'state': '', 'country': 'Rwanda', 'description': 'Luxury lodge near gorilla trekking.', 'rating': 4.9, 'latitude': -1.4500, 'longitude': 29.5500},
            {'name': 'Ellerman House', 'address_line1': '180 Kloof Rd', 'city': 'Cape Town', 'state': 'WC', 'country': 'South Africa', 'description': 'Exclusive boutique hotel with art collection.', 'rating': 4.9, 'latitude': -33.9450, 'longitude': 18.3800},
            {'name': 'Sanctuary Olonana', 'address_line1': 'Masai Mara National Reserve', 'city': 'Masai Mara', 'state': '', 'country': 'Kenya', 'description': 'Luxury tented camp on the Mara River.', 'rating': 4.8, 'latitude': -1.4000, 'longitude': 35.0000},

            # Asia
            {'name': 'The Peninsula Hong Kong', 'address_line1': 'Salisbury Road', 'city': 'Hong Kong', 'state': '', 'country': 'China', 'description': 'Grande dame of Hong Kong hotels.', 'rating': 4.7, 'latitude': 22.2950, 'longitude': 114.1720},
            {'name': 'Marina Bay Sands', 'address_line1': '10 Bayfront Ave', 'city': 'Singapore', 'state': '', 'country': 'Singapore', 'description': 'Iconic hotel with rooftop infinity pool.', 'rating': 4.6, 'latitude': 1.2830, 'longitude': 103.8600},
            {'name': 'The Oberoi Udaivilas', 'address_line1': 'Haridasji Ki Magri', 'city': 'Udaipur', 'state': 'RJ', 'country': 'India', 'description': 'Palatial resort on Lake Pichola.', 'rating': 5.0, 'latitude': 24.5750, 'longitude': 73.6750},
            {'name': 'Four Seasons Tented Camp Golden Triangle', 'address_line1': 'Chiang Rai', 'city': 'Chiang Saen', 'state': '', 'country': 'Thailand', 'description': 'Luxury tented camp with elephants.', 'rating': 5.0, 'latitude': 20.3500, 'longitude': 100.0800},
            {'name': 'Aman Tokyo', 'address_line1': '1-5-6 Otemachi', 'city': 'Tokyo', 'state': '', 'country': 'Japan', 'description': 'Urban sanctuary with minimalist design.', 'rating': 4.9, 'latitude': 35.6860, 'longitude': 139.7650},
            {'name': 'Burj Al Arab Jumeirah', 'address_line1': 'Umm Suqeim 3', 'city': 'Dubai', 'state': '', 'country': 'UAE', 'description': 'Iconic sail-shaped all-suite hotel.', 'rating': 4.8, 'latitude': 25.1410, 'longitude': 55.1850},
            {'name': 'Capella Ubud, Bali', 'address_line1': 'Jl. RY Dalem', 'city': 'Ubud', 'state': 'Bali', 'country': 'Indonesia', 'description': 'Luxury tented camp in the rainforest.', 'rating': 5.0, 'latitude': -8.4500, 'longitude': 115.2600},
            {'name': 'The Ritz-Carlton, Kyoto', 'address_line1': 'Kamogawa Nijo-Ohashi Hotori', 'city': 'Kyoto', 'state': '', 'country': 'Japan', 'description': 'Riverside luxury with traditional aesthetics.', 'rating': 4.8, 'latitude': 35.0120, 'longitude': 135.7720},
            {'name': 'Song Saa Private Island', 'address_line1': 'Koh Rong Archipelago', 'city': 'Sihanoukville', 'state': '', 'country': 'Cambodia', 'description': 'Luxury private island resort.', 'rating': 4.9, 'latitude': 10.6300, 'longitude': 103.1800},
            {'name': 'Mandarin Oriental, Bangkok', 'address_line1': '48 Oriental Ave', 'city': 'Bangkok', 'state': '', 'country': 'Thailand', 'description': 'Legendary riverside hotel.', 'rating': 4.8, 'latitude': 13.7300, 'longitude': 100.5150},

            # Oceania
            {'name': 'Park Hyatt Sydney', 'address_line1': '7 Hickson Rd', 'city': 'Sydney', 'state': 'NSW', 'country': 'Australia', 'description': 'Prime location with Opera House views.', 'rating': 4.7, 'latitude': -33.8570, 'longitude': 151.2080},
            {'name': 'The Brando', 'address_line1': 'Tetiaroa Private Island', 'city': 'Tetiaroa', 'state': '', 'country': 'French Polynesia', 'description': 'Ultra-luxury private island resort.', 'rating': 5.0, 'latitude': -17.0167, 'longitude': -149.5667},
            {'name': 'Huka Lodge', 'address_line1': '271 Huka Falls Rd', 'city': 'Taupo', 'state': '', 'country': 'New Zealand', 'description': 'Luxury lodge on the Waikato River.', 'rating': 4.9, 'latitude': -38.6650, 'longitude': 176.1000},
            {'name': 'Qualia, Hamilton Island', 'address_line1': '20 Whitsunday Blvd', 'city': 'Hamilton Island', 'state': 'QLD', 'country': 'Australia', 'description': 'Luxury resort on the Great Barrier Reef.', 'rating': 4.9, 'latitude': -20.3500, 'longitude': 148.9500},
            {'name': 'Four Seasons Resort Bora Bora', 'address_line1': 'Motu Tehotu', 'city': 'Bora Bora', 'state': '', 'country': 'French Polynesia', 'description': 'Overwater bungalows with mountain views.', 'rating': 4.9, 'latitude': -16.4800, 'longitude': -151.7000},
            {'name': 'Longitude 131°', 'address_line1': 'Yulara Dr', 'city': 'Yulara', 'state': 'NT', 'country': 'Australia', 'description': 'Luxury desert camp overlooking Uluru.', 'rating': 4.9, 'latitude': -25.2400, 'longitude': 130.9800},
            {'name': 'The Farm at Cape Kidnappers', 'address_line1': '446 Clifton Road', 'city': 'Hawke\'s Bay', 'state': '', 'country': 'New Zealand', 'description': 'Luxury lodge on a vast coastal farm.', 'rating': 4.9, 'latitude': -39.6400, 'longitude': 177.0700},
            {'name': 'Laucala Island Resort', 'address_line1': 'Laucala Island', 'city': 'Laucala', 'state': '', 'country': 'Fiji', 'description': 'Exclusive private island resort.', 'rating': 5.0, 'latitude': -16.7500, 'longitude': -179.6700},
            {'name': 'Jackalope Hotel', 'address_line1': '166 Balnarring Rd', 'city': 'Merricks North', 'state': 'VIC', 'country': 'Australia', 'description': 'Luxury hotel in Mornington Peninsula wine region.', 'rating': 4.7, 'latitude': -38.3800, 'longitude': 145.0800},
            {'name': 'Eagles Nest', 'address_line1': '60 Tapeka Road', 'city': 'Russell', 'state': '', 'country': 'New Zealand', 'description': 'Luxury villas overlooking the Bay of Islands.', 'rating': 4.8, 'latitude': -35.2500, 'longitude': 174.1200},

            # Antarctica (Placeholder - Few hotels, using research stations/camps)
            {'name': 'Union Glacier Camp', 'address_line1': 'Union Glacier', 'city': 'Ellsworth Mountains', 'state': '', 'country': 'Antarctica', 'description': 'Seasonal camp for expeditions.', 'rating': 4.0, 'latitude': -79.7667, 'longitude': -83.3000},
            {'name': 'Whichaway Camp', 'address_line1': 'Schirmacher Oasis', 'city': 'Queen Maud Land', 'state': '', 'country': 'Antarctica', 'description': 'Luxury pods on a freshwater lake.', 'rating': 4.5, 'latitude': -70.7667, 'longitude': 11.6667},
        ]

        hotels = []
        # Use the full length of the new data
        for data in hotels_data:
            hotel = Hotel.objects.create(
                name=data['name'],
                address_line1=data['address_line1'],
                city=data['city'],
                state=data['state'],
                country=data['country'],
                description=data['description'],
                star_rating=Decimal(str(data['rating'])).quantize(Decimal("0.1")),
                latitude=Decimal(str(data['latitude'])).quantize(Decimal("0.000001")), # Add latitude
                longitude=Decimal(str(data['longitude'])).quantize(Decimal("0.000001")) # Add longitude
            )
            hotel.amenities.set(random.sample(amenities, k=random.randint(3, min(len(amenities), 5)))) # Ensure k <= len(amenities)
            hotels.append(hotel)
        self.stdout.write(self.style.SUCCESS(f"{len(hotels)} Hotels created."))

        # --- Create Room Types ---
        self.stdout.write("Creating Room Types...")
        room_types_data = [
            {'name': 'Standard Queen', 'description': 'Comfortable room with one queen bed.', 'base_price': 150.00, 'capacity': 2},
            {'name': 'Deluxe King', 'description': 'Spacious room with one king bed and city view.', 'base_price': 250.00, 'capacity': 2},
            {'name': 'Family Suite', 'description': 'Large suite with two queen beds and a sofa bed.', 'base_price': 350.00, 'capacity': 5},
            {'name': 'Single Room', 'description': 'Cozy room with one single bed.', 'base_price': 100.00, 'capacity': 1},
        ]
        room_types = []
        today = timezone.now().date()
        availability_to_create = []
        for hotel in hotels:
            selected_room_types_data = random.sample(room_types_data, k=random.randint(2, 3))
            for data in selected_room_types_data:
                # Add slight price variation per hotel for base price
                base_price = Decimal(str(data['base_price'])) * Decimal(str(random.uniform(0.9, 1.1)))
                room_type = RoomType.objects.create(
                    hotel=hotel,
                    name=data['name'],
                    description=data['description'],
                    base_price=base_price.quantize(Decimal("0.01")), # Corrected field
                    capacity=data['capacity']
                    # available_rooms removed
                )
                room_types.append(room_type)

                # --- Create Room Availability for the next 90 days ---
                initial_available_count = random.randint(5, 15)
                for i in range(90):
                    current_date = today + timedelta(days=i)
                    # Randomly adjust availability slightly day-to-day
                    daily_available = max(0, initial_available_count + random.randint(-2, 2))
                    # Randomly add a price override for some days (e.g., weekends)
                    price_override = None
                    if current_date.weekday() >= 4: # Friday, Saturday, Sunday
                        if random.random() < 0.3: # 30% chance of override
                            price_override = (room_type.base_price * Decimal(str(random.uniform(1.1, 1.5)))).quantize(Decimal("0.01"))

                    availability_to_create.append(RoomAvailability(
                        room_type=room_type,
                        date=current_date,
                        available_count=daily_available,
                        price_override=price_override
                    ))

        # Bulk create availability records
        try:
            RoomAvailability.objects.bulk_create(availability_to_create, ignore_conflicts=True) # Ignore if date/room_type combo exists
            self.stdout.write(self.style.SUCCESS(f"{len(availability_to_create)} Room Availability records created."))
        except IntegrityError as e:
             self.stdout.write(self.style.WARNING(f"Could not bulk create availability, likely due to existing records: {e}"))

        self.stdout.write(self.style.SUCCESS(f"{len(room_types)} Room Types created."))


        # --- Create Booking Statuses ---
        self.stdout.write("Creating Booking Statuses...")
        booking_status_codes = ['PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW']
        booking_statuses = {code: BookingStatus.objects.create(status_code=code, description=f"Booking is {code.lower()}") for code in booking_status_codes}
        self.stdout.write(self.style.SUCCESS(f"{len(booking_statuses)} Booking Statuses created."))

        # --- Create Bookings ---
        self.stdout.write("Creating Bookings...")
        bookings = []
        user_list = list(created_users_qs) # Use the fetched user list
        for i in range(15): # Create 15 sample bookings
            user = random.choice(user_list)
            room_type = random.choice(room_types)
            check_in_offset = random.randint(-10, 60) # Allow some past bookings
            duration = random.randint(1, 7)
            check_in_date = today + timedelta(days=check_in_offset)
            check_out_date = check_in_date + timedelta(days=duration)
            # Use base_price for calculation
            total_price = room_type.base_price * duration
            num_guests = random.randint(1, room_type.capacity)
            status_code = random.choice(list(booking_statuses.keys()))

            # Ensure dates are valid
            if check_out_date <= check_in_date:
                check_out_date = check_in_date + timedelta(days=1)
                duration = 1
                total_price = room_type.base_price * duration # Recalculate

            # TODO: Add logic to check RoomAvailability before creating booking

            booking = Booking.objects.create(
                user=user,
                room_type=room_type,
                check_in_date=check_in_date,
                check_out_date=check_out_date,
                num_guests=num_guests,
                total_price=total_price,
                status=booking_statuses[status_code] # Use status instance
            )
            bookings.append(booking)
        self.stdout.write(self.style.SUCCESS(f"{len(bookings)} Bookings created."))

        # --- Create Booking Guests ---
        self.stdout.write("Creating Booking Guests...")
        booking_guests = []
        for booking in bookings:
            # Add the primary guest (the user who booked)
            booking_guests.append(BookingGuest(
                booking=booking,
                first_name=booking.user.first_name,
                last_name=booking.user.last_name,
                is_primary=True
            ))
            # Add additional random guests if num_guests > 1
            for _ in range(booking.num_guests - 1):
                 booking_guests.append(BookingGuest(
                    booking=booking,
                    first_name=f"GuestFirst{random.randint(1,100)}",
                    last_name=f"GuestLast{random.randint(1,100)}",
                    is_primary=False
                ))
        BookingGuest.objects.bulk_create(booking_guests)
        self.stdout.write(self.style.SUCCESS(f"{len(booking_guests)} Booking Guests created."))

        # --- Create Payment Statuses ---
        self.stdout.write("Creating Payment Statuses...")
        payment_status_codes = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
        payment_statuses = {code: PaymentStatus.objects.create(status_code=code, description=f"Payment is {code.lower()}") for code in payment_status_codes}
        self.stdout.write(self.style.SUCCESS(f"{len(payment_statuses)} Payment Statuses created."))

        # --- Create Payments ---
        self.stdout.write("Creating Payments...")
        payments = []
        for booking in bookings:
            # Create payment only for Confirmed, CheckedIn, CheckedOut bookings
            if booking.status.status_code in ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']:
                # Make payment status usually COMPLETED if booking is confirmed/done
                status_code = 'COMPLETED' if random.random() < 0.9 else 'PENDING'
                payment = Payment(
                    booking=booking,
                    amount=booking.total_price,
                    payment_method=random.choice(['Credit Card', 'PayPal', 'Debit Card']),
                    status=payment_statuses[status_code] # Use status instance
                    # transaction_id is handled by save() method
                )
                # Set status to SUCCESSFUL for save() method to generate ID (adjust if model logic differs)
                if status_code == 'COMPLETED':
                    payment.status = payment_statuses['COMPLETED'] # Assuming 'COMPLETED' maps to successful state for ID gen
                payment.save() # Call save to generate transaction_id if needed
                payments.append(payment)
        self.stdout.write(self.style.SUCCESS(f"{len(payments)} Payments created."))

        # --- Create Reviews ---
        self.stdout.write("Creating Reviews...")
        reviews = []
        # Create reviews only for bookings that are checked out
        past_bookings = [b for b in bookings if b.status.status_code == 'CHECKED_OUT']
        reviewed_bookings = set() # Ensure a booking is reviewed only once
        for booking in random.sample(past_bookings, k=min(len(past_bookings), 7)): # Review ~7 past bookings
            if booking.id not in reviewed_bookings:
                review = Review.objects.create(
                    user=booking.user,
                    hotel=booking.room_type.hotel,
                    booking=booking, # Link review to booking
                    rating=Decimal(str(random.uniform(3.0, 5.0))).quantize(Decimal("0.1")), # Use Decimal for rating
                    title=random.choice(["Great Stay!", "Good Value", "Excellent Service", "Okay Experience", ""]),
                    comment=random.choice([
                        "Very comfortable and clean.",
                        "Staff was friendly and helpful.",
                        "Location was perfect for exploring.",
                        "Met our expectations.",
                        "Would recommend to others.",
                        "" # Allow empty comment
                    ])
                )
                reviews.append(review)
                reviewed_bookings.add(booking.id)
        self.stdout.write(self.style.SUCCESS(f"{len(reviews)} Reviews created."))

        # --- Create Review Responses ---
        self.stdout.write("Creating Review Responses...")
        review_responses = []
        hotel_admin_user = users.get('hoteladmin')
        if hotel_admin_user:
            # Respond to a few reviews
            for review in random.sample(reviews, k=min(len(reviews), 3)):
                 response = ReviewResponse.objects.create(
                     review=review,
                     responder_user=hotel_admin_user,
                     response_text=random.choice([
                         "Thank you for your feedback!",
                         "We're glad you enjoyed your stay.",
                         "We appreciate your comments and hope to see you again.",
                         "Thank you for choosing our hotel."
                     ])
                 )
                 review_responses.append(response)
        self.stdout.write(self.style.SUCCESS(f"{len(review_responses)} Review Responses created."))

        # --- Create Notification Types ---
        self.stdout.write("Creating Notification Types...")
        notification_type_codes = ['BookingConfirmation', 'BookingReminder', 'PaymentReceipt', 'ReviewRequest', 'PasswordReset', 'BookingUpdate']
        notification_types = {code: NotificationType.objects.create(type_code=code, description=f"Notification for {code}") for code in notification_type_codes}
        self.stdout.write(self.style.SUCCESS(f"{len(notification_types)} Notification Types created."))

        # --- Create Notification Logs ---
        self.stdout.write("Creating Notification Logs...")
        notification_logs = []
        user_profiles = {profile.user_id: profile for profile in UserProfile.objects.filter(user__in=user_list)}

        for booking in random.sample(bookings, k=min(len(bookings), 10)): # Log notifications for ~10 bookings
            notif_type = random.choice(list(notification_types.values()))
            channel = random.choice(['EMAIL', 'SMS'])
            profile = user_profiles.get(booking.user_id)
            recipient = booking.user.email if channel == 'EMAIL' else (profile.phone_number if profile else 'N/A')
            status = random.choice(['SENT', 'FAILED', 'PENDING'])
            sent_at = timezone.now() - timedelta(days=random.randint(0, 5)) if status == 'SENT' else None

            if recipient != 'N/A': # Only create log if recipient is valid
                log = NotificationLog(
                    user=booking.user,
                    booking=booking,
                    notification_type=notif_type,
                    channel=channel,
                    recipient=recipient,
                    subject=f"{notif_type.type_code} for Booking #{booking.booking_reference}" if channel == 'EMAIL' else None,
                    content=f"Details about {notif_type.type_code} regarding your booking {booking.booking_reference} for {booking.room_type.hotel.name}.",
                    status=status,
                    sent_at=sent_at
                )
                notification_logs.append(log)
        NotificationLog.objects.bulk_create(notification_logs)
        self.stdout.write(self.style.SUCCESS(f"{len(notification_logs)} Notification Logs created."))

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
