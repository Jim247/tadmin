-- Function to assign a tutor to an enquiry and send emails
-- Run this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION assign_tutor_to_enquiry(
    enquiry_id_param UUID,
    tutor_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    enquiry_record RECORD;
    tutor_record RECORD;
    result JSON;
BEGIN
    -- Get enquiry details
    SELECT * INTO enquiry_record 
    FROM enquiries 
    WHERE id = enquiry_id_param AND status = 'new';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Enquiry not found or already assigned'
        );
    END IF;
    
    -- Get tutor details
    SELECT * INTO tutor_record 
    FROM tutors 
    WHERE id = tutor_id_param AND active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Tutor not found or inactive'
        );
    END IF;
    
    -- Update enquiry with assignment
    UPDATE enquiries 
    SET 
        tutor_id = tutor_id_param,
        status = 'assigned',
        assigned_at = NOW(),
        expires_at = NOW() + INTERVAL '24 hours',
        updated_at = NOW()
    WHERE id = enquiry_id_param;
    
    -- Return success with data for email sending
    result := json_build_object(
        'success', true,
        'enquiry', json_build_object(
            'id', enquiry_record.id,
            'student_name', enquiry_record.student_name,
            'student_email', enquiry_record.student_email,
            'instrument', enquiry_record.instrument,
            'level', enquiry_record.level,
            'location', enquiry_record.location,
            'message', enquiry_record.message
        ),
        'tutor', json_build_object(
            'id', tutor_record.id,
            'name', tutor_record.name,
            'email', tutor_record.email,
            'phone', tutor_record.phone
        ),
        'expires_at', NOW() + INTERVAL '24 hours'
    );
    
    RETURN result;
END;
$$;

-- Function to handle enquiry expiry and add strikes
CREATE OR REPLACE FUNCTION expire_unaccepted_enquiries()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_count INTEGER := 0;
    enquiry_record RECORD;
BEGIN
    -- Find and expire unaccepted enquiries
    FOR enquiry_record IN 
        SELECT e.id, e.tutor_id 
        FROM enquiries e
        WHERE e.status = 'assigned' 
        AND e.expires_at < NOW()
    LOOP
        -- Mark enquiry as expired
        UPDATE enquiries 
        SET status = 'expired', updated_at = NOW()
        WHERE id = enquiry_record.id;
        
        -- Add strike to tutor
        UPDATE tutors 
        SET strikes = strikes + 1, updated_at = NOW()
        WHERE id = enquiry_record.tutor_id;
        
        expired_count := expired_count + 1;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'expired_count', expired_count
    );
END;
$$;
