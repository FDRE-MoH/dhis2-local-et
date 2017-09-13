package org.hisp.dhis.dxf2.datavalue;

import static org.hisp.dhis.commons.util.TextUtils.valueOf;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class StreamingBinaryDataValue extends DataValue
{
    private ObjectOutputStream writer;
    

    private SerializableDataValue dataValue=new SerializableDataValue(); 
    public StreamingBinaryDataValue( ObjectOutputStream  writer )
    {
        this.writer = writer;
    }

    public StreamingBinaryDataValue( Object data )
    {
        this.dataValue=(SerializableDataValue)data;
    }

    //--------------------------------------------------------------------------
    // Getters
    //--------------------------------------------------------------------------

    @Override
    public String getDataElement()
    {
        return dataValue.getDataElement(); 
    }

    @Override
    public String getPeriod()
    {
        return dataValue.getPeriod();
    }

    @Override
    public String getOrgUnit()
    {
        return dataValue.getOrgUnit();
    }

    @Override
    public String getCategoryOptionCombo()
    {
        return dataValue.getCategoryOptionCombo();
    }

    @Override
    public String getAttributeOptionCombo()
    {
        return dataValue.getAttributeOptionCombo();
    }
    
    @Override
    public String getValue()
    {
        return dataValue.getValue();
    }

    @Override
    public String getStoredBy()
    {
        return dataValue.getStoredBy();
    }

    @Override
    public String getLastUpdated()
    {
        return dataValue.getLastUpdated();
    }

    @Override
    public String getComment()
    {
        return dataValue.getComment();
    }

    @Override
    public Boolean getFollowup()
    {
        return dataValue.getFollowUp();
    }
    
    @Override
    public Boolean getDeleted()
    {
        return dataValue.getDeleted();
    }

    //--------------------------------------------------------------------------
    // Setters
    //--------------------------------------------------------------------------

    @Override
    public void setDataElement( String dataElement )
    {
        dataValue.setDataElement( dataElement );
    } 

    @Override
    public void setPeriod( String period )
    {
        dataValue.setPeriod( period );
    }

    @Override
    public void setOrgUnit( String orgUnit )
    {
        dataValue.setOrgUnit( orgUnit );
    }

    @Override
    public void setCategoryOptionCombo( String categoryOptionCombo )
    {
        dataValue.setCategoryOptionCombo( categoryOptionCombo );
    }

    @Override
    public void setAttributeOptionCombo( String attributeOptionCombo )
    {
        dataValue.setAttributeOptionCombo( attributeOptionCombo );
    }

    @Override
    public void setValue( String value )
    {
        dataValue.setValue( value );
    }

    @Override
    public void setStoredBy( String storedBy )
    {
        dataValue.setStoredBy( storedBy );
    }

    @Override
    public void setLastUpdated( String lastUpdated )
    {
        dataValue.setLastUpdated( lastUpdated );
    }

    @Override
    public void setComment( String comment )
    {
        dataValue.setComment( comment );
    }

    @Override
    public void setFollowup( Boolean followup )
    {
        dataValue.setFollowUp( followup );
    }
    
    @Override
    public void setDeleted( Boolean deleted )
    {
        dataValue.setDeleted( deleted );
    }

    @Override
    public void close()
    {
        try
        {
            /*
             * dataValue.setDataElement (this.getDataElement() == null ? null : this.getDataElement());
            temp.setPeriod ( this.getPeriod() == null ? null : this.getPeriod());
            temp.setOrgUnit (this.getOrgUnit() == null ? null : this.getOrgUnit());
            temp.setCategoryOptionCombo( this.getCategoryOptionCombo() == null ? null : this.getCategoryOptionCombo());
            temp.setAttributeOptionCombo (this.getAttributeOptionCombo() == null ? null : this.getAttributeOptionCombo());
            temp.setValue (this.getValue() == null ? null : this.getValue());
            temp.setStoredBy ( this.getStoredBy() == null ? null : this.getStoredBy());
            temp.setLastUpdated ( this.getLastUpdated() == null ? null : this.getLastUpdated());
            temp.setComment ( this.getComment() == null ? null : this.getComment());
            temp.followUp = this.getFollowup();
            */
            //temp.deleted=this.getDeleted();
            writer.writeObject( dataValue );
        }
        catch ( IOException e )
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}
