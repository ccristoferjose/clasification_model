import { useState } from 'react';

const DayCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    name: ''
  });

  // Generate hours for the day (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Helper to format hour display (e.g., "13" -> "1 PM")
  const formatHour = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  // Handle clicking on an empty time slot
  const handleTimeSlotClick = (hour) => {
    setSelectedEvent(null);
    setFormData({
      startTime: hour.toString(),
      endTime: (hour + 1).toString(),
      name: ''
    });
  };

  // Find events at a specific hour
  const getEventsAtHour = (hour) => {
    return events.filter(event => {
      const start = parseInt(event.startTime);
      const end = parseInt(event.endTime);
      return hour >= start && hour < end;
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const newEvent = {
      id: selectedEvent?.id || Date.now(),
      startTime: formData.startTime,
      endTime: formData.endTime,
      name: formData.name
    };

    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(event => event.id === selectedEvent.id ? newEvent : event));
    } else {
      // Create new event
      setEvents([...events, newEvent]);
    }

    // Reset form
    setFormData({ startTime: '', endTime: '', name: '' });
    setSelectedEvent(null);
  };

  // Handle event click for editing
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setFormData({
      startTime: event.startTime,
      endTime: event.endTime,
      name: event.name
    });
  };

  // Handle event deletion
  const handleDelete = () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setFormData({ startTime: '', endTime: '', name: '' });
      setSelectedEvent(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Date Header */}
      <div className="text-2xl font-bold mb-4">
        {new Date().toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>

      {/* Event Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Start Time</label>
            <select
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="border p-2 rounded"
              required
            >
              <option value="">Select time</option>
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">End Time</label>
            <select
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="border p-2 rounded"
              required
            >
              <option value="">Select time</option>
              {hours.map((hour) => (
                <option 
                  key={hour} 
                  value={hour}
                  disabled={parseInt(hour) <= parseInt(formData.startTime || -1)}
                >
                  {formatHour(hour)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm mb-1">Event Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {selectedEvent ? 'Update' : 'Create'} Event
          </button>

          {selectedEvent && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {/* Calendar Grid */}
      <div className="border rounded">
        {hours.map((hour) => {
          const eventsAtHour = getEventsAtHour(hour);
          return (
            <div
              key={hour}
              className="flex border-b last:border-b-0 relative"
              onClick={() => handleTimeSlotClick(hour)}
            >
              {/* Hour Label */}
              <div className="w-20 p-2 border-r bg-gray-50 text-sm">
                {formatHour(hour)}
              </div>

              {/* Event Cell */}
              <div className="flex-1 p-2 min-h-12 relative">
                {eventsAtHour.map((event, index) => (
                  <div
                    key={event.id}
                    className="absolute left-0 bg-blue-100 p-2 border border-blue-200 rounded"
                    style={{
                      top: `${index * 5}px`, // Offsets overlapping events
                      height: `${(parseInt(event.endTime) - parseInt(event.startTime)) * 100}%`,
                      minHeight: '2rem',
                      zIndex: 10 + index, // Ensures event visibility
                      opacity: 0.9 // Adjusts visibility for overlapping events
                    }}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    {event.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayCalendar;
