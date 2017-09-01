package org.hisp.dhis.dxf2.datavalueset;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.io.Serializable;

import org.hisp.dhis.dxf2.datavalue.DataValue;
import org.hisp.dhis.dxf2.datavalue.StreamingBinaryDataValue;

import com.lowagie.text.pdf.codec.Base64.InputStream;

public class StreamingBinaryDataValueSet extends DataValueSet implements Serializable
{
    /**
     * 
     */
    private static final long serialVersionUID = 1429L;

    private ObjectOutputStream writer;
    
    private InputStream reader;
    
    public StreamingBinaryDataValueSet( OutputStream writer )
    {
        try
        {
            this.writer = new ObjectOutputStream( writer );
        }
        catch ( IOException e )
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        
        /*try
        {
            this.writer.writeRecord( StreamingCsvDataValue.getHeaders() ); // Write headers
        }
        catch ( IOException ex )
        {
            throw new RuntimeException( "Failed to write CSV headers", ex );
        }*/
    }
    
    @Override
    public boolean hasNextDataValue()
    {
        
        //TODO 
        return false;
        
        /*
        try
        {
            return reader.readRecord();
        }
        catch ( IOException ex )
        {
            throw new RuntimeException( "Failed to read record", ex );
        }*/
    }

    @Override
    public DataValue getNextDataValue()
    {
        //TODO 
        return new StreamingBinaryDataValue( writer );
        
        /*
        try
        {
            return new StreamingCsvDataValue( reader.getValues() );
        }
        catch ( IOException ex )
        {
            throw new RuntimeException( "Failed to get CSV values", ex );
        }*/
    }

    @Override
    public DataValue getDataValueInstance()
    {
        return new StreamingBinaryDataValue( writer );
    }

    @Override
    public void close()
    {
        if ( writer != null )
        {
            
            
            try
            {
                writer.write( "Closing binaryDataValueSet writer\n".getBytes());
                writer.close();
            }
            catch ( IOException e )
            {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        
        if ( reader != null )
        {
            try
            {
                reader.close();
            }
            catch ( IOException e )
            {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
    }
}
