package org.hisp.dhis.dxf2.datavalueset;

import java.io.BufferedOutputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.io.Serializable;

import org.hisp.dhis.dxf2.datavalue.DataValue;
import org.hisp.dhis.dxf2.datavalue.StreamingBinaryDataValue;

public class StreamingBinaryDataValueSet extends DataValueSet implements Serializable
{
    /**
     * 
     */
    private static final long serialVersionUID = 1429L;

    private ObjectOutputStream writer;
    
    private ObjectInputStream reader;
    
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
        
    }
    
    public StreamingBinaryDataValueSet ( InputStream inputStream) {
        try
        {
            this.reader=new ObjectInputStream( inputStream );
        }
        catch ( IOException e )
        {
            throw new RuntimeException("Failed to create object reader from inputStream (file upload)");
        }
    }
    
    @Override
    //TODO test if this might block in a slow connection because if the 
    //file is too large and the reading is fast, the available might return 0 before all file is uploaded.
    public boolean hasNextDataValue()
    {
        try
        {
            return reader.available()<0 ? false : true;
        }
        catch ( IOException e )
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public DataValue getNextDataValue()
    {
        try
        {
            return new StreamingBinaryDataValue( reader.readObject() );
        }
        catch( EOFException ex) {
            //because available doesn't work very well it needs to be edited to this.
            return null;
        }
        catch ( IOException ex )
        {
            throw new RuntimeException( "Failed to read object from the encoded file", ex );
        }
        catch ( ClassNotFoundException ex )
        {
            throw new RuntimeException( "Failed to read object from the encoded file", ex );
        }
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
                e.printStackTrace();
            }
        }
    }
}
