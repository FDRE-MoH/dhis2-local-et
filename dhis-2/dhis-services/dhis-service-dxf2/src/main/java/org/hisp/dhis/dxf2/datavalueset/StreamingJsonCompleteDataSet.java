/**
 * 
 */
package org.hisp.dhis.dxf2.datavalueset;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;

/**
 * @author abyot
 *
 */
public class StreamingJsonCompleteDataSet extends CompleteDataSet
{
    private JsonGenerator generator;

    public StreamingJsonCompleteDataSet( JsonGenerator generator )
    {
        this.generator = generator;

        try
        {
            generator.writeStartObject();
        }
        catch ( IOException ignored )
        {

        }
    }

    @Override
    public void setDataSet( String dataSet )
    {
        writeObjectField( "dataSet", dataSet );
    }

    @Override
    public void setPeriod( String period )
    {
        writeObjectField( "period", period );
    }

    @Override
    public void setOrgUnit( String orgUnit )
    {
        writeObjectField( "orgUnit", orgUnit );
    }

    @Override
    public void setAttributeOptionCombo( String attributeOptionCombo )
    {
        writeObjectField( "attributeOptionCombo", attributeOptionCombo );
    }

    @Override
    public void setCompleteDate( String completeDate )
    {
        writeObjectField( "completeDate", completeDate );
    }

    @Override
    public void close()
    {
        if ( generator == null )
        {
            return;
        }

        try
        {
            generator.writeEndObject();
        }
        catch ( IOException ignored )
        {
        }
    }

    private void writeObjectField( String fieldName, Object value )
    {
        if ( value == null )
        {
            return;
        }

        try
        {
            generator.writeObjectField( fieldName, value );
        }
        catch ( IOException ignored )
        {
        }
    }
}
