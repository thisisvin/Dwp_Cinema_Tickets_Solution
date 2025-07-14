import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert';
import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

describe('TicketService', () => {
    let ticketService;

    beforeEach(() => {
        ticketService = new TicketService();
    });

    describe('Valid ticket purchases', () => {
        it('should successfully purchase adult tickets only', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 2);
            
            assert.doesNotThrow(() => {
                ticketService.purchaseTickets(1, adultTickets);
            });
        });

        it('should successfully purchase mixed tickets with adult', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 2);
            const childTickets = new TicketTypeRequest('CHILD', 1);
            const infantTickets = new TicketTypeRequest('INFANT', 1);
            
            assert.doesNotThrow(() => {
                ticketService.purchaseTickets(1, adultTickets, childTickets, infantTickets);
            });
        });

        it('should handle maximum 25 tickets', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 25);
            
            assert.doesNotThrow(() => {
                ticketService.purchaseTickets(1, adultTickets);
            });
        });

        it('should handle multiple ticket requests of same type', () => {
            const adultTickets1 = new TicketTypeRequest('ADULT', 2);
            const adultTickets2 = new TicketTypeRequest('ADULT', 3);
            
            assert.doesNotThrow(() => {
                ticketService.purchaseTickets(1, adultTickets1, adultTickets2);
            });
        });
    });

    describe('Invalid account ID', () => {
        it('should throw exception for zero account ID', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 1);
            
            assert.throws(() => {
                ticketService.purchaseTickets(0, adultTickets);
            }, InvalidPurchaseException);
        });

        it('should throw exception for negative account ID', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 1);
            
            assert.throws(() => {
                ticketService.purchaseTickets(-1, adultTickets);
            }, InvalidPurchaseException);
        });

        it('should throw exception for non-integer account ID', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 1);
            
            assert.throws(() => {
                ticketService.purchaseTickets(1.5, adultTickets);
            }, InvalidPurchaseException);
        });
    });

    describe('Invalid ticket requests', () => {
        it('should throw exception for no ticket requests', () => {
            assert.throws(() => {
                ticketService.purchaseTickets(1);
            }, InvalidPurchaseException);
        });

        it('should throw exception for empty ticket requests', () => {
            assert.throws(() => {
                ticketService.purchaseTickets(1, []);
            }, InvalidPurchaseException);
        });
    });

    describe('Business rule violations', () => {
        it('should throw exception for more than 25 tickets', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 26);
            
            assert.throws(() => {
                ticketService.purchaseTickets(1, adultTickets);
            }, InvalidPurchaseException);
        });

        it('should throw exception for child tickets without adult', () => {
            const childTickets = new TicketTypeRequest('CHILD', 1);
            
            assert.throws(() => {
                ticketService.purchaseTickets(1, childTickets);
            }, InvalidPurchaseException);
        });

        it('should throw exception for infant tickets without adult', () => {
            const infantTickets = new TicketTypeRequest('INFANT', 1);
            
            assert.throws(() => {
                ticketService.purchaseTickets(1, infantTickets);
            }, InvalidPurchaseException);
        });

        it('should throw exception for child and infant tickets without adult', () => {
            const childTickets = new TicketTypeRequest('CHILD', 1);
            const infantTickets = new TicketTypeRequest('INFANT', 1);
            
            assert.throws(() => {
                ticketService.purchaseTickets(1, childTickets, infantTickets);
            }, InvalidPurchaseException);
        });

        it('should throw exception when total tickets exceed 25', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 20);
            const childTickets = new TicketTypeRequest('CHILD', 6);
            
            assert.throws(() => {
                ticketService.purchaseTickets(1, adultTickets, childTickets);
            }, InvalidPurchaseException);
        });
    });

    describe('TicketTypeRequest validation', () => {
        it('should throw exception for zero ticket count', () => {
            assert.throws(() => {
                const zeroTickets = new TicketTypeRequest('ADULT', 0);
                ticketService.purchaseTickets(1, zeroTickets);
            }, InvalidPurchaseException);
        });

        it('should throw exception for negative ticket count', () => {
            assert.throws(() => {
                const negativeTickets = new TicketTypeRequest('ADULT', -1);
                ticketService.purchaseTickets(1, negativeTickets);
            }, InvalidPurchaseException);
        });
    });

    describe('Edge cases', () => {
        it('should handle single infant with adult', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 1);
            const infantTickets = new TicketTypeRequest('INFANT', 1);
            
            assert.doesNotThrow(() => {
                ticketService.purchaseTickets(1, adultTickets, infantTickets);
            });
        });

        it('should handle multiple infants with single adult', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 1);
            const infantTickets = new TicketTypeRequest('INFANT', 5);
            
            assert.doesNotThrow(() => {
                ticketService.purchaseTickets(1, adultTickets, infantTickets);
            });
        });

        it('should handle boundary case of exactly 25 tickets', () => {
            const adultTickets = new TicketTypeRequest('ADULT', 10);
            const childTickets = new TicketTypeRequest('CHILD', 10);
            const infantTickets = new TicketTypeRequest('INFANT', 5);
            
            assert.doesNotThrow(() => {
                ticketService.purchaseTickets(1, adultTickets, childTickets, infantTickets);
            });
        });
    });
});