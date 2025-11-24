interface BookingDetails {
    name: string;
    email: string;
    packageTitle: string;
    date: string;
    time: string;
}

/**
 * Simulates sending a booking confirmation email.
 * In a real application, this would use an email API (e.g., SendGrid, Mailgun).
 */
export const sendConfirmation = async (bookingDetails: BookingDetails): Promise<{ success: true }> => {
    const { name, email, packageTitle, date, time } = bookingDetails;

    console.log('--- SIMULATING EMAIL ---');
    console.log(`To: ${email}`);
    console.log(`Subject: Your Booking Confirmation for UNDERLA.STUDIO`);
    console.log('');
    console.log(`Hi ${name},`);
    console.log('');
    console.log(`This is a confirmation that your request for the "${packageTitle}" package has been received.`);
    console.log(`Date: ${new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
    console.log(`Time: ${time}`);
    console.log('');
    console.log(`Our team will be in touch shortly to finalize the details.`);
    console.log('');
    console.log('Thank you for booking with us!');
    console.log('--- END SIMULATION ---');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true };
};