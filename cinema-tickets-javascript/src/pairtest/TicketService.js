import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
    constructor() {
        this.paymentService = new TicketPaymentService();
        this.seatReservationService = new SeatReservationService();
    }

    /**
     * Should only have private methods other than the one below.
     */
    purchaseTickets(accountId, ...ticketTypeRequests) {
        // Validate account ID
        this.#validateAccountId(accountId);
        
        // Validate ticket requests
        this.#validateTicketRequests(ticketTypeRequests);
        
        // Count tickets by type
        const ticketCounts = this.#countTicketsByType(ticketTypeRequests);
        
        // Validate business rules
        this.#validateBusinessRules(ticketCounts);
        
        // Calculate total amount and seats
        const totalAmount = this.#calculateTotalAmount(ticketCounts);
        const totalSeats = this.#calculateSeatsToReserve(ticketCounts);
        
        // Make payment request
        this.paymentService.makePayment(accountId, totalAmount);
        
        // Make seat reservation request
        this.seatReservationService.reserveSeat(accountId, totalSeats);
    }

    #validateAccountId(accountId) {
        if (!Number.isInteger(accountId) || accountId <= 0) {
            throw new InvalidPurchaseException('Account ID must be a positive integer');
        }
    }

    #validateTicketRequests(ticketTypeRequests) {
        if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
            throw new InvalidPurchaseException('At least one ticket request is required');
        }

        for (const request of ticketTypeRequests) {
            if (!(request instanceof TicketTypeRequest)) {
                throw new InvalidPurchaseException('All ticket requests must be valid TicketTypeRequest objects');
            }
            if (request.getNoOfTickets() <= 0) {
                throw new InvalidPurchaseException('Number of tickets must be greater than 0');
            }
        }
    }

    #countTicketsByType(ticketTypeRequests) {
        const ticketCounts = {
            ADULT: 0,
            CHILD: 0,
            INFANT: 0
        };

        for (const request of ticketTypeRequests) {
            const type = request.getTicketType();
            const count = request.getNoOfTickets();
            ticketCounts[type] += count;
        }

        return ticketCounts;
    }

    #validateBusinessRules(ticketCounts) {
        const totalTickets = ticketCounts.ADULT + ticketCounts.CHILD + ticketCounts.INFANT;
        
        // Maximum 25 tickets rule
        if (totalTickets > 25) {
            throw new InvalidPurchaseException('Maximum 25 tickets can be purchased at a time');
        }

        // Adult ticket requirement rule
        if (ticketCounts.ADULT === 0 && (ticketCounts.CHILD > 0 || ticketCounts.INFANT > 0)) {
            throw new InvalidPurchaseException('Child and Infant tickets cannot be purchased without purchasing an Adult ticket');
        }

        // All counts must be non-negative (should already be validated but double-check)
        if (ticketCounts.ADULT < 0 || ticketCounts.CHILD < 0 || ticketCounts.INFANT < 0) {
            throw new InvalidPurchaseException('Invalid ticket counts');
        }
    }

    #calculateTotalAmount(ticketCounts) {
        const ADULT_PRICE = 25;
        const CHILD_PRICE = 15;
        const INFANT_PRICE = 0;

        const totalAmount = (ticketCounts.ADULT * ADULT_PRICE) +
                           (ticketCounts.CHILD * CHILD_PRICE) +
                           (ticketCounts.INFANT * INFANT_PRICE);

        return totalAmount;
    }

    #calculateSeatsToReserve(ticketCounts) {
        // Only Adult and Child tickets get seats, Infants sit on Adult's lap
        return ticketCounts.ADULT + ticketCounts.CHILD;
    }
}