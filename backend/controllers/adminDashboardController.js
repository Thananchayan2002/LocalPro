const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Professional = require('../models/Professional');
const User = require('../models/User');

/**
 * GET /admin/dashboard/summary
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    // Total professionals and customers
    const totalProfessionals = await Professional.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Total bookings
    const totalBookings = await Booking.countDocuments();

    // Revenue calculation: sum of paymentByUser
    const payments = await Payment.find({});
    let totalRevenue = 0;

    payments.forEach(p => {
      if (p.paymentByUser) totalRevenue += p.paymentByUser;
    });

    // Admin commission = 10% of total revenue
    const adminCommission = totalRevenue * 0.1;

    res.json({
      totalProfessionals,
      totalCustomers,
      totalBookings,
      totalRevenue,
      adminCommission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Dashboard summary error' });
  }
};

/**
 * GET /admin/dashboard/monthly-revenue
 */
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;

    // Fetch payments for current and previous year
    const payments = await Payment.aggregate([
      { $match: { paymentByUser: { $ne: null } } },
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $project: {
          year: { $year: '$booking.createdAt' },
          month: { $month: '$booking.createdAt' },
          amount: '$paymentByUser'
        }
      },
      { $match: { year: { $in: [currentYear, previousYear] } } },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    // Build all 12 months with 0 if no data
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const formatData = (year) => {
      return months.map(month => {
        const entry = payments.find(p => p._id.year === year && p._id.month === month);
        const revenue = entry ? entry.revenue : 0;
        return {
          year,
          month,
          revenue,
          commission: revenue * 0.1
        };
      });
    };

    const result = [...formatData(previousYear), ...formatData(currentYear)];

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Monthly revenue error' });
  }
};
/**
 * GET /admin/dashboard/bookings-by-service
 */
exports.getBookingsByService = async (req, res) => {
  try {
    const MAX_SERVICES = 10; // Maximum/top services to send
    const MIN_SERVICES = 10; // Ensure at least 10

    // Step 1: Aggregate booking counts by service
    let data = await Booking.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },  // Sort by count descending (top services first)
      { $limit: MAX_SERVICES }    // Limit to top 10 services
    ]);

    // Step 2: Fill with placeholders if less than MIN_SERVICES
    const filledData = [...data];
    let placeholderIndex = 1;

    while (filledData.length < MIN_SERVICES) {
      filledData.push({
        _id: `N/A`, // Or you can do `Service ${placeholderIndex}`
        count: 0
      });
      placeholderIndex++;
    }

    res.json(filledData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Service graph error' });
  }
};
/**
 * GET /admin/dashboard/monthly-booking
 */
exports.getMonthlyBookingsComparison = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // Step 1: Aggregate monthly booking counts for both years
    const bookings = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${previousYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Step 2: Prepare month-wise data
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const prevData = months.map(month => {
      const entry = bookings.find(b => b._id.year === previousYear && b._id.month === month);
      return { month, prevBookings: entry ? entry.count : 0 };
    });

    const currData = months.map(month => {
      const entry = bookings.find(b => b._id.year === currentYear && b._id.month === month);
      return { month, currBookings: entry ? entry.count : 0 };
    });

    // Step 3: Merge previous and current year data
    const mergedData = months.map((month, idx) => ({
      month,
      prevBookings: prevData[idx].prevBookings,
      currBookings: currData[idx].currBookings
    }));

    res.json(mergedData);

  } catch (err) {
    console.error('Monthly bookings comparison error:', err);
    res.status(500).json({ message: 'Error fetching monthly bookings comparison' });
  }
};