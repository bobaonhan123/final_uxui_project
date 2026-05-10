"""
Seed script — run with:
    cd bn_concert/backend
    uv run python -m app.seed
"""

import random
from datetime import date, datetime, timedelta, timezone

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.concert import Artist, Venue, Section, Seat, Concert, EventSeat, ConcertStatus, SeatStatus
from app.models.order import Order, OrderItem, Ticket
from app.models.content import Blog, Comment, FAQ, GiftCard
from app.services.auth_service import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Artist).first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    # ── Artists ──────────────────────────────────────────────
    artists = [
        Artist(
            name="Taylor Swift",
            slug="taylor-swift",
            bio="Taylor Alison Swift is an American singer-songwriter. Recognized for her songwriting, musical versatility, artistic reinventions, and influence on the music industry.",
            image_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            genre="Pop",
            facebook_url="https://facebook.com/TaylorSwift",
            instagram_url="https://instagram.com/taylorswift",
            spotify_url="https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02",
            x_url="https://x.com/taylorswift13",
        ),
        Artist(
            name="Selena Gomez",
            slug="selena-gomez",
            bio="Selena Marie Gomez is an American singer, actress, and producer. After appearing on the children's television series Barney & Friends, she rose to prominence for her role as Alex Russo in Wizards of Waverly Place.",
            image_url="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
            genre="Pop",
            facebook_url="https://facebook.com/Selena",
            instagram_url="https://instagram.com/selenagomez",
            spotify_url="https://open.spotify.com/artist/0C8ZW7ezQVs4URX5aX7Kqx",
            x_url="https://x.com/selenagomez",
        ),
        Artist(
            name="Ed Sheeran",
            slug="ed-sheeran",
            bio="Edward Christopher Sheeran MBE is an English singer-songwriter. Born in Halifax, West Yorkshire, and raised in Framlingham, Suffolk, he began writing songs around the age of eleven.",
            image_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            genre="Pop / Folk",
            facebook_url="https://facebook.com/EdSheeranMusic",
            instagram_url="https://instagram.com/teddysphotos",
            spotify_url="https://open.spotify.com/artist/6eUKZXaKkcviH0Ku9w2n3V",
            x_url="https://x.com/edsheeran",
        ),
    ]
    db.add_all(artists)
    db.flush()

    # ── Venues ──────────────────────────────────────────────
    venues = [
        Venue(
            name="Ziggo Dome",
            address="De Passage 100",
            city="Amsterdam",
            country="Netherlands",
            capacity=17000,
            image_url="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
        ),
        Venue(
            name="Rotterdam Ahoy",
            address="Ahoyweg 10",
            city="Rotterdam",
            country="Netherlands",
            capacity=15000,
            image_url="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
        ),
    ]
    db.add_all(venues)
    db.flush()

    # ── Sections & Seats ────────────────────────────────────
    section_defs = [
        ("VIP Front", "#FF6B6B", 250.0),
        ("Section A", "#4ECDC4", 200.0),
        ("Section B", "#45B7D1", 150.0),
        ("Section C", "#96CEB4", 100.0),
    ]
    all_sections: list[Section] = []
    all_seats: list[Seat] = []

    for venue in venues:
        for sec_name, color, price in section_defs:
            section = Section(
                venue_id=venue.id,
                name=sec_name,
                color=color,
                price=price,
            )
            db.add(section)
            db.flush()
            all_sections.append(section)

            rows = "ABCDEFGHIJ"
            for row_letter in rows:
                for seat_num in range(1, 21):
                    seat = Seat(
                        section_id=section.id,
                        row=row_letter,
                        number=seat_num,
                        label=f"{row_letter}{seat_num}",
                    )
                    db.add(seat)
                    all_seats.append(seat)
    db.flush()

    # ── Concerts ────────────────────────────────────────────
    now = datetime.now(timezone.utc)
    concerts = [
        Concert(
            artist_id=artists[0].id,
            venue_id=venues[0].id,
            title="Taylor Swift — The Eras Tour (Amsterdam)",
            description="Experience the magic of Taylor Swift's record-breaking Eras Tour live in Amsterdam. A journey through all musical eras.",
            date=now + timedelta(days=30),
            doors_open="18:00",
            show_start="20:00",
            image_url="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
            min_price=100.0,
            max_price=250.0,
            status=ConcertStatus.UPCOMING,
            is_featured=True,
        ),
        Concert(
            artist_id=artists[0].id,
            venue_id=venues[1].id,
            title="Taylor Swift — The Eras Tour (Rotterdam)",
            description="The Eras Tour continues in Rotterdam. Don't miss this spectacular show.",
            date=now + timedelta(days=32),
            doors_open="18:00",
            show_start="20:00",
            image_url="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
            min_price=100.0,
            max_price=250.0,
            status=ConcertStatus.UPCOMING,
            is_featured=False,
        ),
        Concert(
            artist_id=artists[1].id,
            venue_id=venues[0].id,
            title="Selena Gomez — Revival World Tour",
            description="Selena Gomez brings her Revival World Tour to Amsterdam with all her greatest hits.",
            date=now + timedelta(days=45),
            doors_open="19:00",
            show_start="21:00",
            image_url="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800",
            min_price=100.0,
            max_price=250.0,
            status=ConcertStatus.UPCOMING,
            is_featured=True,
        ),
        Concert(
            artist_id=artists[2].id,
            venue_id=venues[1].id,
            title="Ed Sheeran — Mathematics Tour",
            description="Ed Sheeran's Mathematics Tour featuring songs from his latest albums.",
            date=now + timedelta(days=60),
            doors_open="18:30",
            show_start="20:30",
            image_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            min_price=100.0,
            max_price=250.0,
            status=ConcertStatus.UPCOMING,
            is_featured=True,
        ),
        Concert(
            artist_id=artists[2].id,
            venue_id=venues[0].id,
            title="Ed Sheeran — Intimate Acoustic Night",
            description="An intimate acoustic performance by Ed Sheeran. Limited seats available.",
            date=now + timedelta(days=75),
            doors_open="19:00",
            show_start="20:00",
            image_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
            min_price=100.0,
            max_price=250.0,
            status=ConcertStatus.UPCOMING,
            is_featured=False,
        ),
        Concert(
            artist_id=artists[1].id,
            venue_id=venues[1].id,
            title="Selena Gomez — Summer Festival",
            description="Selena Gomez headlines the Summer Festival in Rotterdam.",
            date=now + timedelta(days=90),
            doors_open="16:00",
            show_start="18:00",
            image_url="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800",
            min_price=100.0,
            max_price=250.0,
            status=ConcertStatus.UPCOMING,
            is_featured=False,
        ),
    ]
    db.add_all(concerts)
    db.flush()

    # ── EventSeats (link each concert to its venue's seats) ─
    for concert in concerts:
        venue_sections = [s for s in all_sections if s.venue_id == concert.venue_id]
        for section in venue_sections:
            section_seats = db.query(Seat).filter(Seat.section_id == section.id).all()
            for seat in section_seats:
                es = EventSeat(
                    concert_id=concert.id,
                    seat_id=seat.id,
                    status=SeatStatus.AVAILABLE,
                    price=section.price,
                )
                db.add(es)
    db.flush()

    # ── Blogs ───────────────────────────────────────────────
    blog_data = [
        ("The Ultimate Guide to Concert Etiquette", "the-ultimate-guide-to-concert-etiquette", "Music", "Learn the dos and don'ts of attending live concerts.", "concert,etiquette,live"),
        ("Top 10 Concert Venues in the Netherlands", "top-10-concert-venues-netherlands", "Venues", "Discover the best places to experience live music in the Netherlands.", "venues,netherlands,music"),
        ("How to Get the Best Seats at Any Concert", "how-to-get-best-seats", "Tips", "Expert tips for securing front-row seats at your favorite shows.", "seats,tips,concert"),
        ("Taylor Swift's Eras Tour: What to Expect", "taylor-swift-eras-tour-what-to-expect", "Artists", "Everything you need to know about Taylor Swift's biggest tour yet.", "Celebrity,TaylorSwift,Concert"),
        ("The Rise of Selena Gomez: From Disney to Superstardom", "rise-of-selena-gomez", "Artists", "A look at Selena Gomez's incredible journey in the music industry.", "Celebrity,SelenaGomez,Concert"),
        ("Ed Sheeran: The Songwriter of a Generation", "ed-sheeran-songwriter-generation", "Artists", "How Ed Sheeran became one of the most successful songwriters of our time.", "Celebrity,EdSheeran,Music"),
        ("What to Wear to a Concert: Style Guide", "what-to-wear-concert-style-guide", "Lifestyle", "Fashion tips for every type of concert from rock shows to classical performances.", "lifestyle,concert,style"),
        ("How to Protect Your Hearing at Concerts", "protect-hearing-at-concerts", "Health", "Important tips for enjoying live music without damaging your hearing.", "health,concert,safety"),
        ("Concert Photography: Capturing the Perfect Moment", "concert-photography-tips", "Photography", "Tips for taking amazing photos at live events.", "photography,concert,tips"),
        ("The History of Live Music in Amsterdam", "history-live-music-amsterdam", "Culture", "Explore Amsterdam's rich live music heritage from jazz clubs to modern arenas.", "culture,amsterdam,music"),
        ("Festival Season 2026: Must-See Events", "festival-season-2026-must-see", "Events", "The most anticipated music festivals coming in 2026.", "festival,events,concert"),
        ("Behind the Scenes: How Concert Venues Prepare", "behind-scenes-concert-venues", "Industry", "A look at the massive effort that goes into preparing a venue for a major concert.", "industry,venues,concert"),
    ]
    blogs: list[Blog] = []
    for title, slug, category, excerpt, tags in blog_data:
        blog = Blog(
            title=title,
            slug=slug,
            excerpt=excerpt,
            content=f"<p>{excerpt}</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
            image_url=f"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
            author_name="BNConcert Editorial",
            category=category,
            tags=tags,
            views=random.randint(50, 5000),
        )
        db.add(blog)
        blogs.append(blog)
    db.flush()

    # ── Blog comments (for carousel demos) ───────────────────
    featured_blog = next((blog for blog in blogs if blog.slug == "taylor-swift-eras-tour-what-to-expect"), blogs[0])
    demo_comments = [
        "Taylor Swift’s concert was absolutely phenomenal and lived up to all the hype. Stunning visuals and flawless vocals!",
        "The atmosphere in the arena was incredible. Every song had the crowd singing along in full energy.",
        "A technically impressive show with immersive staging and unforgettable moments from start to finish.",
    ]
    for content in demo_comments:
        db.add(
            Comment(
                blog_id=featured_blog.id,
                author_name=random.choice(["Samuel Garcia", "Paula Green", "Nas Rashid"]),
                content=content,
                is_approved=True,
            )
        )

    # ── FAQs ────────────────────────────────────────────────
    faq_data = [
        ("How do I purchase tickets?", "Browse concerts, select your seats, and proceed to checkout. You can pay with bank card, iDeal, or PayPal.", "Buying Tickets", 1),
        ("Can I cancel my order?", "Pending orders can be cancelled before payment. Paid orders follow our refund policy.", "Orders", 2),
        ("How long are seats held during checkout?", "Seats are held for 10 minutes while you complete your purchase.", "Buying Tickets", 3),
        ("What payment methods do you accept?", "We accept bank cards (Visa, Mastercard), iDeal, and PayPal.", "Payment", 4),
        ("How do I use a gift card?", "Enter your gift card code during checkout. The balance will be applied to your order total.", "Payment", 5),
        ("Can I transfer my ticket to someone else?", "Tickets are linked to your account but can be transferred by contacting support.", "Tickets", 6),
        ("What is ticket insurance?", "Ticket insurance covers cancellation and allows a full refund if you cannot attend. It costs 5% of the ticket price.", "Insurance", 7),
        ("How do I access my e-tickets?", "E-tickets with QR codes are available in your order history after payment.", "Tickets", 8),
        ("What happens if a concert is cancelled?", "If a concert is cancelled, all ticket holders will receive a full refund automatically.", "Cancellations", 9),
        ("How do I contact customer support?", "You can reach us through the Contact Us page or email support@bnconcert.com.", "Support", 10),
    ]
    for question, answer, category, order in faq_data:
        faq = FAQ(question=question, answer=answer, category=category, order=order)
        db.add(faq)
    db.flush()

    # ── Gift Cards ──────────────────────────────────────────
    gift_cards = [
        GiftCard(code="GC-ABCD-1234", original_balance=50.0, current_balance=50.0),
        GiftCard(code="GC-EFGH-5678", original_balance=100.0, current_balance=100.0),
        GiftCard(code="GC-IJKL-9012", original_balance=25.0, current_balance=25.0),
        GiftCard(code="GC-MNOP-3456", original_balance=200.0, current_balance=200.0),
        GiftCard(code="GC-QRST-7890", original_balance=75.0, current_balance=75.0),
    ]
    db.add_all(gift_cards)

    # ── Demo User ───────────────────────────────────────────
    demo_user = User(
        email="sylvievanbeek@gmail.com",
        hashed_password=hash_password("password123"),
        first_name="Sylvie",
        last_name="Van Beek",
        phone="+31612345678",
        date_of_birth=date(1988, 1, 26),
        gender="Female",
        address="Delftwegstraat 23",
        city="Delft",
        state="South Holland",
        zip_code="2611AA",
        country="Netherlands",
        is_verified=True,
        newsletter=True,
        notifications_enabled=True,
    )
    db.add(demo_user)

    db.commit()
    db.close()
    print("Database seeded successfully!")


if __name__ == "__main__":
    seed()
